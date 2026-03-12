import { redirect, isRedirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { stripe } from '$lib/server/stripe';
import { createAdminClient } from '$lib/server/supabase';
import type Stripe from 'stripe';

function getPaymentIntentId(paymentIntent: string | Stripe.PaymentIntent | null): string | null {
	if (typeof paymentIntent === 'string') return paymentIntent;
	if (paymentIntent?.id) return paymentIntent.id;
	return null;
}

export const load: PageServerLoad = async ({ url, locals, cookies }) => {
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

	if (stripeSession.payment_status !== 'paid') {
		redirect(303, '/checkout?error=payment_incomplete');
	}

	const supabaseAdmin = createAdminClient();
	const metadata = stripeSession.metadata || {};
	const paymentIntentId = getPaymentIntentId(stripeSession.payment_intent);

	// If user is already authenticated, record payment and show success
	if (locals.user) {
		// Update profile to member (idempotent)
		await supabaseAdmin
			.from('profiles')
			.update({
				is_member: true,
				member_since: new Date().toISOString(),
				stripe_customer_id: stripeSession.customer as string
			})
			.eq('id', locals.user.id);

		// Record payment (idempotent via unique constraint on stripe_checkout_session_id)
		const { error: paymentError } = await supabaseAdmin
			.from('payments')
			.insert({
				user_id: locals.user.id,
				stripe_checkout_session_id: stripeSession.id,
				stripe_payment_intent_id: paymentIntentId,
				amount: stripeSession.amount_total || 0,
				currency: stripeSession.currency || 'gbp',
				status: 'succeeded',
				promo_code_id: metadata.promo_code_id || null,
				discount_amount: stripeSession.total_details?.amount_discount || 0
			});

		if (!paymentError && metadata.promo_code_id) {
			await supabaseAdmin.rpc('increment_promo_code_usage', {
				code_id: metadata.promo_code_id
			});
		}

		return { sessionId, success: true };
	}

	const pendingSignupCookie = cookies.get('pending_signup');

	if (pendingSignupCookie) {
		try {
			const { fullName, email, password } = JSON.parse(pendingSignupCookie);

			// Find or create the user account
			let userId: string | undefined;

			const { data: existingProfile } = await supabaseAdmin
				.from('profiles')
				.select('id, is_member')
				.eq('email', email)
				.maybeSingle();

			if (existingProfile) {
				userId = existingProfile.id;
				// Update to user's chosen password (webhook may have set a random one)
				await supabaseAdmin.auth.admin.updateUserById(existingProfile.id, { password });
			} else {
				const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
					email,
					password,
					email_confirm: true,
					user_metadata: { full_name: fullName }
				});

				if (authError) {
					if (authError.message?.includes('already been registered')) {
						// Race condition with webhook - find the user and update password
						const { data: raceProfile } = await supabaseAdmin
							.from('profiles')
							.select('id')
							.eq('email', email)
							.maybeSingle();
						userId = raceProfile?.id;
						if (userId) {
							await supabaseAdmin.auth.admin.updateUserById(userId, { password });
						}
					} else {
						console.error('Error creating user:', authError);
					}
				} else if (authData.user) {
					userId = authData.user.id;
				}
			}

			// Ensure profile is set to member (webhook may or may not have done this yet)
			if (userId) {
				await supabaseAdmin
					.from('profiles')
					.update({
						is_member: true,
						member_since: new Date().toISOString(),
						stripe_customer_id: stripeSession.customer as string
					})
					.eq('id', userId);

				// Record payment (idempotent via unique constraint on stripe_checkout_session_id)
				const { error: paymentError } = await supabaseAdmin
					.from('payments')
					.insert({
						user_id: userId,
						stripe_checkout_session_id: stripeSession.id,
						stripe_payment_intent_id: paymentIntentId,
						amount: stripeSession.amount_total || 0,
						currency: stripeSession.currency || 'gbp',
						status: 'succeeded',
						promo_code_id: metadata.promo_code_id || null,
						discount_amount: stripeSession.total_details?.amount_discount || 0
					});

				if (!paymentError && metadata.promo_code_id) {
					await supabaseAdmin.rpc('increment_promo_code_usage', {
						code_id: metadata.promo_code_id
					});
				}
			}

			// Try to sign the user in automatically
			const { error: signInError } = await locals.supabase.auth.signInWithPassword({
				email,
				password
			});

			cookies.delete('pending_signup', { path: '/' });

			if (!signInError) {
				// Redirect to refresh the session in hooks
				redirect(303, `/checkout/success?session_id=${sessionId}`);
			}

			// Sign-in failed but account is set up — show success with sign-in link
			console.error('Auto sign-in failed after payment:', signInError);
			return {
				sessionId,
				success: true,
				needsSignIn: true,
				email
			};
		} catch (err) {
			if (isRedirect(err)) throw err;
			console.error('Error processing pending signup:', err);
			cookies.delete('pending_signup', { path: '/' });
		}
	}

	// No pending signup and no user session — payment succeeded but we can't
	// auto-sign-in. The webhook handles account setup independently.
	return {
		sessionId,
		success: true,
		needsSignIn: true,
		email: stripeSession.customer_email || undefined
	};
};
