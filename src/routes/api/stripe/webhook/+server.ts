import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { stripe } from '$lib/server/stripe';
import { env } from '$env/dynamic/private';
import { createAdminClient } from '$lib/server/supabase';
import { sendEmail, welcomeEmail, purchaseConfirmationEmail, passwordResetEmail } from '$lib/server/email';
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
	const hasSupabaseKey = !!env.SUPABASE_SECRET_KEY;

	return json({
		status: 'ok',
		env: {
			STRIPE_WEBHOOK_SECRET: hasSecret ? 'set' : 'MISSING',
			STRIPE_SECRET_KEY: hasStripeKey ? 'set' : 'MISSING',
			SUPABASE_SECRET_KEY: hasSupabaseKey ? 'set' : 'MISSING'
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
		const supabaseAdmin = createAdminClient();

		switch (event.type) {
			case 'checkout.session.completed': {
				const session = event.data.object as Stripe.Checkout.Session;
				console.log('[webhook] checkout.session.completed:', {
					sessionId: session.id,
					email: session.customer_details?.email || session.customer_email,
					paymentStatus: session.payment_status,
					metadata: session.metadata
				});

				await handleCheckoutComplete(session, supabaseAdmin);
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

async function handleCheckoutComplete(
	session: Stripe.Checkout.Session,
	supabaseAdmin: ReturnType<typeof createAdminClient>
) {
	const customerEmail = session.customer_details?.email || session.customer_email;
	const metadata = session.metadata || {};
	const promoCodeId = metadata.promo_code_id;
	const existingUserId = metadata.user_id;
	const isPendingSignup = metadata.pending_signup === 'true';
	const fullName = metadata.full_name || '';

	let userId = existingUserId;

	// For pending signups, create the user account
	if (isPendingSignup && !userId && customerEmail) {
		const randomPassword = crypto.randomUUID() + 'A1!';

		const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
			email: customerEmail,
			password: randomPassword,
			email_confirm: true,
			user_metadata: { full_name: fullName }
		});

		if (authError) {
			if (authError.message?.includes('already been registered')) {
				// User already created (by success page or previous attempt)
				const { data: existingProfile } = await supabaseAdmin
					.from('profiles')
					.select('id')
					.eq('email', customerEmail)
					.single();

				userId = existingProfile?.id;
			} else {
				console.error('Error creating user in webhook:', authError);
				return;
			}
		} else if (authData.user) {
			userId = authData.user.id;

			// Generate password reset link so user can set their own password
			const { data: resetData } = await supabaseAdmin.auth.admin.generateLink({
				type: 'recovery',
				email: customerEmail
			});

			if (resetData?.properties?.action_link) {
				const resetEmailContent = passwordResetEmail(resetData.properties.action_link);
				await sendEmail({
					to: customerEmail,
					subject: resetEmailContent.subject,
					html: resetEmailContent.html,
					text: resetEmailContent.text
				});
			}
		}
	}

	// If we still don't have a user ID, try to find by email
	if (!userId && customerEmail) {
		const { data: existingProfile } = await supabaseAdmin
			.from('profiles')
			.select('id')
			.eq('email', customerEmail)
			.single();

		userId = existingProfile?.id;
	}

	if (!userId) {
		console.error('No user ID found for checkout session:', session.id);
		return;
	}

	// Update profile to member status
	const profileUpdate: Record<string, unknown> = {
		is_member: true,
		member_since: new Date().toISOString(),
		is_admin: customerEmail === env.ADMIN_EMAIL
	};
	if (typeof session.customer === 'string') {
		profileUpdate.stripe_customer_id = session.customer;
	}
	const { error: profileError } = await supabaseAdmin
		.from('profiles')
		.update(profileUpdate)
		.eq('id', userId);

	if (profileError) {
		console.error('Error updating profile:', profileError);
	}

	// Record the payment (idempotent - unique constraint on stripe_checkout_session_id)
	const { error: paymentError } = await supabaseAdmin
		.from('payments')
		.insert({
			user_id: userId,
			stripe_checkout_session_id: session.id,
			stripe_payment_intent_id: getPaymentIntentId(session.payment_intent),
			amount: session.amount_total || 0,
			currency: session.currency || 'gbp',
			status: 'succeeded',
			promo_code_id: promoCodeId || null,
			discount_amount: (session.total_details?.amount_discount || 0)
		});

	const paymentAlreadyRecorded = paymentError?.code === '23505';

	if (paymentError && !paymentAlreadyRecorded) {
		console.error('Error recording payment:', paymentError);
	}

	// Only increment promo and send emails if this is the first recording
	// (avoids double-increment / double-email when both webhook and success page run)
	if (paymentAlreadyRecorded) {
		return;
	}

	// Increment promo code usage if applicable
	if (promoCodeId) {
		await supabaseAdmin.rpc('increment_promo_code_usage', {
			code_id: promoCodeId
		});
	}

	// Get user name for emails
	const { data: profile } = await supabaseAdmin
		.from('profiles')
		.select('full_name, email')
		.eq('id', userId)
		.single();

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
