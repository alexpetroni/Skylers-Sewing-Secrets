import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { eq, sql } from 'drizzle-orm';
import type { PgUpdateSetSource } from 'drizzle-orm/pg-core';
import { stripe } from '$lib/server/stripe';
import { env } from '$env/dynamic/private';
import { db } from '$lib/server/db';
import { payments, profiles } from '$lib/server/db/schema';
import { getAuth } from '$lib/server/auth';
import { createCredentialUser, ensureProfile, findUserIdByEmail } from '$lib/server/users';
import { sendEmail, welcomeEmail, purchaseConfirmationEmail } from '$lib/server/email';
import type Stripe from 'stripe';

function getPaymentIntentId(paymentIntent: string | Stripe.PaymentIntent | null): string | null {
	if (typeof paymentIntent === 'string') return paymentIntent;
	if (paymentIntent?.id) return paymentIntent.id;
	return null;
}

/** GET handler for health checking — visit /api/stripe/webhook in the browser to verify the endpoint is reachable */
export const GET: RequestHandler = async () => {
	const hasSecret = !!env.STRIPE_WEBHOOK_SECRET;
	const hasStripeKey = !!env.STRIPE_SECRET_KEY;
	const hasDatabaseUrl = !!env.DATABASE_URL;
	const hasAuthSecret = !!env.BETTER_AUTH_SECRET;

	return json({
		status: 'ok',
		env: {
			STRIPE_WEBHOOK_SECRET: hasSecret ? 'set' : 'MISSING',
			STRIPE_SECRET_KEY: hasStripeKey ? 'set' : 'MISSING',
			DATABASE_URL: hasDatabaseUrl ? 'set' : 'MISSING',
			BETTER_AUTH_SECRET: hasAuthSecret ? 'set' : 'MISSING'
		}
	});
};

export const POST: RequestHandler = async ({ request }) => {
	console.log('[webhook] POST received');

	const body = await request.text();
	const signature = request.headers.get('stripe-signature');

	if (!signature || !env.STRIPE_WEBHOOK_SECRET) {
		console.error('[webhook] Missing signature or webhook secret', {
			hasSignature: !!signature,
			hasWebhookSecret: !!env.STRIPE_WEBHOOK_SECRET
		});
		return json({ error: 'Missing signature or webhook secret' }, { status: 400 });
	}

	let event: Stripe.Event;

	try {
		event = stripe.webhooks.constructEvent(body, signature, env.STRIPE_WEBHOOK_SECRET!);
	} catch (err) {
		console.error('[webhook] Signature verification failed:', err);
		return json({ error: 'Invalid signature' }, { status: 400 });
	}

	console.log('[webhook] Event verified:', event.type, event.id);

	try {
		switch (event.type) {
			case 'checkout.session.completed': {
				const session = event.data.object as Stripe.Checkout.Session;
				console.log('[webhook] checkout.session.completed:', {
					sessionId: session.id,
					email: session.customer_details?.email || session.customer_email,
					paymentStatus: session.payment_status,
					metadata: session.metadata
				});

				await handleCheckoutComplete(session);
				break;
			}

			case 'payment_intent.payment_failed': {
				const paymentIntent = event.data.object as Stripe.PaymentIntent;
				console.error('[webhook] Payment failed:', paymentIntent.id);
				break;
			}
		}
	} catch (err) {
		console.error('[webhook] Error handling event:', err);
		return json({ error: 'Internal error' }, { status: 500 });
	}

	return json({ received: true });
};

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
	if (session.payment_status !== 'paid') {
		console.log('[webhook] Ignoring checkout.session.completed with payment_status:', session.payment_status);
		return;
	}

	const customerEmail = session.customer_details?.email || session.customer_email;
	const metadata = session.metadata || {};
	const promoCodeId = metadata.promo_code_id;
	const existingUserId = metadata.user_id;
	const isPendingSignup = metadata.pending_signup === 'true';
	const fullName = metadata.full_name || '';

	let userId: string | undefined = existingUserId;

	// For pending signups, create the user account
	if (isPendingSignup && !userId && customerEmail) {
		const randomPassword = crypto.randomUUID() + 'A1!';

		try {
			userId = await createCredentialUser({
				email: customerEmail,
				password: randomPassword,
				fullName
			});

			// Send a password-reset email so the user can set their own password
			// (Better Auth mints the token and sends via the Resend template)
			try {
				await getAuth().api.requestPasswordReset({
					body: { email: customerEmail, redirectTo: '/auth/reset-password' }
				});
			} catch (resetError) {
				console.error('[webhook] Failed to send set-password email:', resetError);
			}
		} catch (createError) {
			// User already created (by success page or previous attempt)
			console.error('[webhook] Error creating user:', createError);
			userId = (await findUserIdByEmail(customerEmail)) ?? undefined;
			if (!userId) {
				console.error('[webhook] Could not find existing user for:', customerEmail);
				return;
			}
		}
	}

	// Ensure profile exists (defensive)
	if (userId && customerEmail) {
		await ensureProfile({ userId, email: customerEmail, fullName });
	}

	// If we still don't have a user ID, try to find by email
	if (!userId && customerEmail) {
		const [existingProfile] = await db
			.select({ id: profiles.id })
			.from(profiles)
			.where(sql`lower(${profiles.email}) = lower(${customerEmail})`)
			.limit(1);

		userId = existingProfile?.id;

		if (!userId) {
			const foundId = await findUserIdByEmail(customerEmail);
			if (foundId) {
				userId = foundId;
				await ensureProfile({ userId, email: customerEmail, fullName });
			}
		}
	}

	if (!userId) {
		console.error('[webhook] No user ID found for checkout session:', session.id);
		return;
	}

	// Update profile to member status
	const profileUpdate: PgUpdateSetSource<typeof profiles> = {
		is_member: true,
		// coalesce so a retried/duplicate delivery of this event never resets
		// an existing member's join date
		member_since: sql`coalesce(${profiles.member_since}, now())`
	};
	// Only ever grant the admin flag here, never revoke it — a buyer who is
	// already an admin must not lose the flag just because they also bought
	// the course, and only the configured ADMIN_EMAIL should ever gain it.
	if (env.ADMIN_EMAIL && customerEmail?.toLowerCase() === env.ADMIN_EMAIL.toLowerCase()) {
		profileUpdate.is_admin = true;
	}
	if (typeof session.customer === 'string') {
		profileUpdate.stripe_customer_id = session.customer;
	}

	try {
		await db.update(profiles).set(profileUpdate).where(eq(profiles.id, userId));
	} catch (profileError) {
		console.error('Error updating profile:', profileError);
	}

	// Record the payment (idempotent — unique constraint on stripe_checkout_session_id;
	// an empty returning() result means it was already recorded)
	let inserted: { id: string }[] = [];
	try {
		inserted = await db
			.insert(payments)
			.values({
				user_id: userId,
				stripe_checkout_session_id: session.id,
				stripe_payment_intent_id: getPaymentIntentId(session.payment_intent),
				amount: session.amount_total || 0,
				currency: session.currency || 'gbp',
				status: 'succeeded',
				promo_code_id: promoCodeId || null,
				discount_amount: session.total_details?.amount_discount || 0
			})
			.onConflictDoNothing()
			.returning({ id: payments.id });
	} catch (paymentError) {
		// Rethrow so the handler returns 500 and Stripe retries this
		// (idempotent) event instead of silently losing the payment record
		console.error('Error recording payment:', paymentError);
		throw paymentError;
	}

	// Only increment promo and send emails if this is the first recording
	// (avoids double-increment / double-email when both webhook and success page run)
	if (inserted.length === 0) {
		return;
	}

	// Increment promo code usage if applicable
	if (promoCodeId) {
		try {
			await db.execute(sql`SELECT increment_promo_code_usage(${promoCodeId}::uuid)`);
		} catch (promoError) {
			console.error('[webhook] Error incrementing promo usage:', promoError);
		}
	}

	// Get user name for emails
	const [profile] = await db
		.select({ full_name: profiles.full_name, email: profiles.email })
		.from(profiles)
		.where(eq(profiles.id, userId))
		.limit(1);

	const userName = profile?.full_name || 'there';
	const userEmail = profile?.email || customerEmail;

	if (userEmail) {
		// Format amount for email (convert from pence)
		const amountFormatted = new Intl.NumberFormat('en-GB', {
			style: 'currency',
			currency: session.currency || 'gbp'
		}).format((session.amount_total || 0) / 100);

		// Send welcome email
		const welcome = welcomeEmail(userName);
		await sendEmail({
			to: userEmail,
			subject: welcome.subject,
			html: welcome.html,
			text: welcome.text
		});

		// Send purchase confirmation email
		const confirmation = purchaseConfirmationEmail(userName, amountFormatted);
		await sendEmail({
			to: userEmail,
			subject: confirmation.subject,
			html: confirmation.html,
			text: confirmation.text
		});
	}
}
