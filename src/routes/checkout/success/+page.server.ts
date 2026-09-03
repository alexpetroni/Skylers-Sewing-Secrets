import { redirect, isRedirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { eq, sql } from 'drizzle-orm';
import type { PgUpdateSetSource } from 'drizzle-orm/pg-core';
import { stripe } from '$lib/server/stripe';
import { db } from '$lib/server/db';
import { payments, profiles } from '$lib/server/db/schema';
import { getAuth } from '$lib/server/auth';
import {
	createCredentialUser,
	ensureProfile,
	findUserIdByEmail,
	setUserPassword
} from '$lib/server/users';
import type Stripe from 'stripe';

function getPaymentIntentId(paymentIntent: string | Stripe.PaymentIntent | null): string | null {
	if (typeof paymentIntent === 'string') return paymentIntent;
	if (paymentIntent?.id) return paymentIntent.id;
	return null;
}

export const load: PageServerLoad = async ({ url, locals, cookies, request }) => {
	const sessionId = url.searchParams.get('session_id');

	if (!sessionId) {
		redirect(303, '/checkout');
	}

	// Verify the Stripe session
	let stripeSession;
	try {
		stripeSession = await stripe.checkout.sessions.retrieve(sessionId);
	} catch (err) {
		console.error('Error retrieving Stripe session:', err);
		redirect(303, '/checkout?error=invalid_session');
	}

	console.log('[success] Processing payment session:', {
		sessionId,
		paymentStatus: stripeSession.payment_status,
		customerEmail: stripeSession.customer_email,
		customerDetailsEmail: stripeSession.customer_details?.email,
		metadata: stripeSession.metadata,
		hasUser: !!locals.user
	});

	if (stripeSession.payment_status !== 'paid') {
		redirect(303, '/checkout?error=payment_incomplete');
	}

	const metadata = stripeSession.metadata || {};
	const paymentIntentId = getPaymentIntentId(stripeSession.payment_intent);

	// The email that was actually charged for this session — the only source
	// of truth for which account this payment belongs to, never the
	// pending_signup cookie (which may belong to a different checkout attempt)
	const paidEmail = stripeSession.customer_details?.email || stripeSession.customer_email || undefined;

	// If user is already authenticated, ensure profile + record membership
	if (locals.user) {
		console.log('[success] User already authenticated:', locals.user.id);
		const userEmail = locals.user.email || paidEmail || '';
		await ensureProfile({ userId: locals.user.id, email: userEmail });
		await recordMembership(locals.user.id, stripeSession, metadata, paymentIntentId);
		return { sessionId, success: true };
	}

	if (!paidEmail) {
		console.error('[success] No email found on Stripe session — cannot create user');
		return { sessionId, success: true, needsSignIn: true, email: undefined };
	}

	const email = paidEmail;

	// The pending_signup cookie only contributes credentials when it matches
	// the email that was actually charged; a cookie from a different/earlier
	// checkout attempt must not lend its password to this payment
	const pendingSignupCookie = cookies.get('pending_signup');
	let password: string | undefined;
	let fullName: string | undefined;
	let hadCookiePassword = false;

	if (pendingSignupCookie) {
		try {
			const parsed = JSON.parse(pendingSignupCookie);
			if (typeof parsed.email === 'string' && parsed.email.trim().toLowerCase() === email.toLowerCase()) {
				if (typeof parsed.password === 'string') {
					password = parsed.password;
					hadCookiePassword = true;
				}
				if (typeof parsed.fullName === 'string') {
					fullName = parsed.fullName;
				}
				console.log('[success] Using pending_signup cookie for:', email);
			} else {
				console.error('[success] pending_signup cookie email does not match paid session email, ignoring cookie', {
					cookieEmail: parsed.email,
					paidEmail: email
				});
			}
		} catch {
			console.error('[success] Failed to parse pending_signup cookie');
		}
		cookies.delete('pending_signup', { path: '/' });
	} else {
		console.log('[success] No pending_signup cookie found');
	}

	if (!fullName) {
		fullName = stripeSession.customer_details?.name || metadata.full_name || undefined;
	}

	// Find or create the user
	let userId: string | undefined;

	try {
		// First check if a profile exists (case-insensitive)
		const [existingProfile] = await db
			.select({ id: profiles.id })
			.from(profiles)
			.where(sql`lower(${profiles.email}) = lower(${email})`)
			.limit(1);

		if (existingProfile) {
			userId = existingProfile.id;
			console.log('[success] Found existing profile:', userId);
		} else {
			// Try to create the user (also creates the profile row)
			console.log('[success] No profile found, creating user for:', email);
			const tempPassword = password || crypto.randomUUID() + 'A1!';
			try {
				userId = await createCredentialUser({
					email,
					password: tempPassword,
					fullName: fullName || ''
				});
				console.log('[success] User created:', userId);

				if (!hadCookiePassword) {
					// No password the user chose made it here — send a set-password
					// link so they have a real way back in (the webhook does the
					// same for the case where it creates the account instead)
					try {
						await getAuth().api.requestPasswordReset({
							body: { email, redirectTo: '/auth/reset-password' }
						});
					} catch (resetError) {
						console.error('[success] Failed to send set-password email:', resetError);
					}
				}

				if (!password) password = tempPassword;
			} catch (createErr) {
				// Most likely the user already exists (created by the webhook)
				console.error('[success] createCredentialUser error:', createErr);
				userId = (await findUserIdByEmail(email)) ?? undefined;
				console.log('[success] Got user ID from lookup:', userId);
			}

			// Ensure profile exists (defensive)
			if (userId) {
				await ensureProfile({ userId, email, fullName });
			}
		}

		// Restore the user's chosen password (from the cookie) so sign-in works.
		// If cookie was lost we do NOT overwrite with a random password — that
		// would destroy the password set during creation or by the webhook.
		if (userId && password) {
			try {
				await setUserPassword(userId, password);
			} catch (pwError) {
				console.error('[success] Failed to set password:', pwError);
				password = undefined;
			}
		}

		// Record membership and payment
		if (userId) {
			console.log('[success] Recording membership for:', userId);
			await recordMembership(userId, stripeSession, metadata, paymentIntentId);
		} else {
			console.error('[success] No userId — skipping membership recording');
		}

		// Try to sign the user in (session cookie set via sveltekitCookies plugin)
		console.log('[success] Attempting sign-in for:', email, 'hasPassword:', !!password);
		const signedIn = await trySignIn(request.headers, email, password);
		console.log('[success] Sign-in result:', signedIn);
		if (signedIn) {
			redirect(303, `/checkout/success?session_id=${sessionId}`);
		}
	} catch (err) {
		if (isRedirect(err)) throw err;
		console.error('[success] Error processing signup after payment:', err);
	}

	console.log('[success] Returning needsSignIn for:', email);
	return { sessionId, success: true, needsSignIn: true, email };
};

/** Record payment and update profile to member. All operations are idempotent. */
async function recordMembership(
	userId: string,
	stripeSession: Stripe.Checkout.Session,
	metadata: Record<string, string>,
	paymentIntentId: string | null
) {
	const profileUpdate: PgUpdateSetSource<typeof profiles> = {
		is_member: true,
		// coalesce so revisiting this page (or a retried webhook delivery)
		// never resets an existing member's join date
		member_since: sql`coalesce(${profiles.member_since}, now())`
	};
	if (typeof stripeSession.customer === 'string') {
		profileUpdate.stripe_customer_id = stripeSession.customer;
	}

	try {
		await db.update(profiles).set(profileUpdate).where(eq(profiles.id, userId));
	} catch (profileError) {
		console.error('[success] Error updating profile to member:', profileError);
	}

	// Idempotent: unique constraint on stripe_checkout_session_id — an empty
	// returning() result means the payment was already recorded
	let inserted: { id: string }[] = [];
	try {
		inserted = await db
			.insert(payments)
			.values({
				user_id: userId,
				stripe_checkout_session_id: stripeSession.id,
				stripe_payment_intent_id: paymentIntentId,
				amount: stripeSession.amount_total || 0,
				currency: stripeSession.currency || 'gbp',
				status: 'succeeded',
				promo_code_id: metadata.promo_code_id || null,
				discount_amount: stripeSession.total_details?.amount_discount || 0
			})
			.onConflictDoNothing()
			.returning({ id: payments.id });
	} catch (paymentError) {
		console.error('[success] Error recording payment:', paymentError);
	}

	if (inserted.length > 0 && metadata.promo_code_id) {
		try {
			await db.execute(sql`SELECT increment_promo_code_usage(${metadata.promo_code_id}::uuid)`);
		} catch (promoError) {
			console.error('[success] Error incrementing promo usage:', promoError);
		}
	}
}

/** Try password sign-in; there is no magic-link fallback anymore, the page
 * shows a "sign in" prompt instead (needsSignIn). */
async function trySignIn(
	headers: Headers,
	email: string,
	password: string | undefined
): Promise<boolean> {
	if (!password) return false;

	try {
		await getAuth().api.signInEmail({ body: { email, password }, headers });
		return true;
	} catch (error) {
		console.error('[success] Password sign-in failed:', error);
		return false;
	}
}
