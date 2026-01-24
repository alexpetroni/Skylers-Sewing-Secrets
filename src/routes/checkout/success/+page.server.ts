import { redirect, isRedirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { stripe } from '$lib/server/stripe';
import { createAdminClient } from '$lib/server/supabase';

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

	// Check if this is a pending signup (new user who needs account created)
	const pendingSignupCookie = cookies.get('pending_signup');

	if (pendingSignupCookie && !locals.user) {
		// This is a new user - create their account
		try {
			const { fullName, email, password } = JSON.parse(pendingSignupCookie);

			// Create the user account
			const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
				email,
				password,
				email_confirm: true,
				user_metadata: {
					full_name: fullName
				}
			});

			if (authError) {
				// User might already exist (e.g., page refresh)
				if (authError.message?.includes('already been registered')) {
					// Try to sign them in instead
					const { error: signInError } = await locals.supabase.auth.signInWithPassword({
						email,
						password
					});

					if (signInError) {
						console.error('Error signing in existing user:', signInError);
						// Clear cookie and redirect to sign-in
						cookies.delete('pending_signup', { path: '/' });
						redirect(303, '/auth/sign-in?message=account_exists');
					}

					// Clear cookie and redirect to refresh session
					cookies.delete('pending_signup', { path: '/' });
					redirect(303, `/checkout/success?session_id=${sessionId}`);
				} else {
					console.error('Error creating user:', authError);
					throw authError;
				}
			} else if (authData.user) {
				// New user created - sign them in
				const { error: signInError } = await locals.supabase.auth.signInWithPassword({
					email,
					password
				});

				if (signInError) {
					console.error('Error signing in new user:', signInError);
					// Account created but couldn't sign in - redirect to sign-in page
					cookies.delete('pending_signup', { path: '/' });
					redirect(303, '/auth/sign-in?message=account_created');
				}

				// Update profile to member status
				const { error: profileError } = await supabaseAdmin
					.from('profiles')
					.update({
						is_member: true,
						member_since: new Date().toISOString(),
						stripe_customer_id: stripeSession.customer as string
					})
					.eq('id', authData.user.id);

				if (profileError) {
					console.error('Error updating profile:', profileError);
				}

				// Record the payment
				const metadata = stripeSession.metadata || {};
				const { error: paymentError } = await supabaseAdmin
					.from('payments')
					.insert({
						user_id: authData.user.id,
						stripe_checkout_session_id: stripeSession.id,
						stripe_payment_intent_id: stripeSession.payment_intent as string,
						amount: stripeSession.amount_total || 0,
						currency: stripeSession.currency || 'gbp',
						status: 'succeeded',
						promo_code_id: metadata.promo_code_id || null,
						discount_amount: stripeSession.total_details?.amount_discount || 0
					});

				if (paymentError) {
					console.error('Error recording payment:', paymentError);
				}

				// Increment promo code usage if applicable
				if (metadata.promo_code_id) {
					await supabaseAdmin.rpc('increment_promo_code_usage', {
						code_id: metadata.promo_code_id
					});
				}

				// Clear cookie and redirect to refresh session with new auth
				cookies.delete('pending_signup', { path: '/' });
				redirect(303, `/checkout/success?session_id=${sessionId}`);
			}

			// Clear the pending signup cookie (fallback)
			cookies.delete('pending_signup', { path: '/' });
		} catch (err) {
			// Re-throw redirects - they're not errors
			if (isRedirect(err)) {
				throw err;
			}
			console.error('Error processing pending signup:', err);
			cookies.delete('pending_signup', { path: '/' });
			redirect(303, '/checkout?error=signup_failed');
		}
	} else if (!locals.user) {
		// No pending signup cookie and no user - this shouldn't happen
		// Try to find user by email
		const customerEmail = stripeSession.customer_email;
		if (customerEmail) {
			redirect(303, `/auth/sign-in?email=${encodeURIComponent(customerEmail)}&message=please_sign_in`);
		}
		redirect(303, '/auth/sign-in');
	}

	return {
		sessionId,
		success: true
	};
};
