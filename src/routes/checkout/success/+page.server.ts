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

	const supabaseAdmin = createAdminClient();
	const metadata = stripeSession.metadata || {};
	const paymentIntentId = getPaymentIntentId(stripeSession.payment_intent);

	// If user is already authenticated, record payment and show success
	if (locals.user) {
		console.log('[success] User already authenticated:', locals.user.id);
		await recordMembership(supabaseAdmin, locals.user.id, stripeSession, metadata, paymentIntentId);
		return { sessionId, success: true };
	}

	// Determine user details from cookie or Stripe session
	const pendingSignupCookie = cookies.get('pending_signup');
	let email: string | undefined;
	let password: string | undefined;
	let fullName: string | undefined;

	if (pendingSignupCookie) {
		try {
			const parsed = JSON.parse(pendingSignupCookie);
			email = parsed.email;
			password = parsed.password;
			fullName = parsed.fullName;
			console.log('[success] Got email from cookie:', email);
		} catch {
			console.error('[success] Failed to parse pending_signup cookie');
		}
		cookies.delete('pending_signup', { path: '/' });
	} else {
		console.log('[success] No pending_signup cookie found');
	}

	// Always fall back to Stripe session data for email/name
	// (cookie is often lost across the cross-domain Stripe redirect)
	if (!email) {
		email = stripeSession.customer_details?.email
			|| stripeSession.customer_email
			|| undefined;
		console.log('[success] Email from Stripe fallback:', email);
	}
	if (!fullName) {
		fullName = stripeSession.customer_details?.name
			|| metadata.full_name
			|| undefined;
	}

	if (!email) {
		console.error('[success] No email found from any source — cannot create user');
		return {
			sessionId,
			success: true,
			needsSignIn: true,
			email: undefined
		};
	}

	// Find or create the user
	let userId: string | undefined;

	try {
		const { data: existingProfile } = await supabaseAdmin
			.from('profiles')
			.select('id')
			.eq('email', email)
			.maybeSingle();

		if (existingProfile) {
			userId = existingProfile.id;
			console.log('[success] Found existing profile:', userId);
			if (password) {
				const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(existingProfile.id, { password });
				if (updateError) {
					console.error('[success] Failed to update user password:', updateError);
					password = undefined;
				}
			}
		} else {
			console.log('[success] No profile found, creating user for:', email);
			const tempPassword = password || crypto.randomUUID() + 'A1!';
			const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
				email,
				password: tempPassword,
				email_confirm: true,
				user_metadata: { full_name: fullName || '' }
			});

			if (authError) {
				console.error('[success] createUser error:', authError.message);
				if (authError.message?.includes('already been registered')) {
					const { data: raceProfile } = await supabaseAdmin
						.from('profiles')
						.select('id')
						.eq('email', email)
						.maybeSingle();
					userId = raceProfile?.id;
					console.log('[success] Race condition — found profile:', userId);
					if (userId && password) {
						const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, { password });
						if (updateError) {
							console.error('[success] Failed to update password (race):', updateError);
							password = undefined;
						}
					}
				}
			} else if (authData.user) {
				userId = authData.user.id;
				if (!password) password = tempPassword;
				console.log('[success] User created:', userId);
			}
		}

		// Record membership and payment
		if (userId) {
			console.log('[success] Recording membership for:', userId);
			await recordMembership(supabaseAdmin, userId, stripeSession, metadata, paymentIntentId);
		} else {
			console.error('[success] No userId — skipping membership recording');
		}

		// Try to sign the user in
		console.log('[success] Attempting sign-in for:', email, 'hasPassword:', !!password);
		const signedIn = await trySignIn(locals.supabase, supabaseAdmin, email, password);
		console.log('[success] Sign-in result:', signedIn);
		if (signedIn) {
			redirect(303, `/checkout/success?session_id=${sessionId}`);
		}
	} catch (err) {
		if (isRedirect(err)) throw err;
		console.error('[success] Error processing signup after payment:', err);
	}

	console.log('[success] Returning needsSignIn for:', email);
	return {
		sessionId,
		success: true,
		needsSignIn: true,
		email
	};
};

/** Record payment and update profile to member. All operations are idempotent. */
async function recordMembership(
	supabaseAdmin: ReturnType<typeof createAdminClient>,
	userId: string,
	stripeSession: Stripe.Checkout.Session,
	metadata: Record<string, string>,
	paymentIntentId: string | null
) {
	const profileUpdate: Record<string, unknown> = {
		is_member: true,
		member_since: new Date().toISOString()
	};
	if (typeof stripeSession.customer === 'string') {
		profileUpdate.stripe_customer_id = stripeSession.customer;
	}
	const { error: profileError } = await supabaseAdmin
		.from('profiles')
		.update(profileUpdate)
		.eq('id', userId);

	if (profileError) {
		console.error('Error updating profile to member:', profileError);
	}

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

/** Try password sign-in first, then fall back to admin-generated magic link. */
async function trySignIn(
	supabase: App.Locals['supabase'],
	supabaseAdmin: ReturnType<typeof createAdminClient>,
	email: string,
	password: string | undefined
): Promise<boolean> {
	// Try password sign-in if we have the password
	if (password) {
		const { error } = await supabase.auth.signInWithPassword({ email, password });
		if (!error) return true;
		console.error('Password sign-in failed:', error.message);
	}

	// Fallback: generate a magic link token via admin API and verify it
	try {
		const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
			type: 'magiclink',
			email
		});

		if (linkError || !linkData?.properties?.hashed_token) {
			console.error('Failed to generate magic link:', linkError?.message);
			return false;
		}

		const { error: verifyError } = await supabase.auth.verifyOtp({
			token_hash: linkData.properties.hashed_token,
			type: 'magiclink'
		});

		if (!verifyError) return true;
		console.error('Magic link verification failed:', verifyError.message);
	} catch (err) {
		console.error('Error during magic link sign-in:', err);
	}

	return false;
}
