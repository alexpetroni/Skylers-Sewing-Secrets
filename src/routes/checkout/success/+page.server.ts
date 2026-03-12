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

/** Ensure a profile row exists for the given auth user (the DB trigger may not be active). */
async function ensureProfile(
	supabaseAdmin: ReturnType<typeof createAdminClient>,
	userId: string,
	email: string,
	fullName: string | undefined
) {
	const { data: existing } = await supabaseAdmin
		.from('profiles')
		.select('id')
		.eq('id', userId)
		.maybeSingle();

	if (existing) return;

	console.log('[success] Profile missing for user', userId, '— creating manually');
	const { error } = await supabaseAdmin
		.from('profiles')
		.insert({
			id: userId,
			email,
			full_name: fullName || null
		});

	if (error) {
		// Might already exist due to race — that's fine
		if (error.code !== '23505') {
			console.error('[success] Failed to create profile:', error);
		}
	}
}

/** Get a user's ID by email using the admin generateLink API. */
async function getUserIdByEmail(
	supabaseAdmin: ReturnType<typeof createAdminClient>,
	email: string
): Promise<string | undefined> {
	try {
		const { data, error } = await supabaseAdmin.auth.admin.generateLink({
			type: 'magiclink',
			email
		});
		if (error || !data?.user?.id) {
			console.error('[success] generateLink failed:', error?.message);
			return undefined;
		}
		return data.user.id;
	} catch (err) {
		console.error('[success] getUserIdByEmail error:', err);
		return undefined;
	}
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

	// If user is already authenticated, ensure profile + record membership
	if (locals.user) {
		console.log('[success] User already authenticated:', locals.user.id);
		const userEmail = locals.user.email || stripeSession.customer_email || '';
		await ensureProfile(supabaseAdmin, locals.user.id, userEmail, undefined);
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
		return { sessionId, success: true, needsSignIn: true, email: undefined };
	}

	// Find or create the user
	let userId: string | undefined;

	try {
		// First check if profile exists
		const { data: existingProfile } = await supabaseAdmin
			.from('profiles')
			.select('id')
			.eq('email', email)
			.maybeSingle();

		if (existingProfile) {
			userId = existingProfile.id;
			console.log('[success] Found existing profile:', userId);
		} else {
			// Try to create the auth user
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
					// Auth user exists but profile is missing — get user ID via generateLink
					console.log('[success] Auth user exists but no profile — looking up user ID');
					userId = await getUserIdByEmail(supabaseAdmin, email);
					console.log('[success] Got user ID from generateLink:', userId);
				}
			} else if (authData.user) {
				userId = authData.user.id;
				if (!password) password = tempPassword;
				console.log('[success] User created:', userId);
			}

			// Ensure profile exists (the DB trigger may not be active)
			if (userId) {
				await ensureProfile(supabaseAdmin, userId, email, fullName);
			}
		}

		// Restore the user's chosen password (from the cookie) so sign-in works
		// If cookie was lost we do NOT overwrite with a random password — that
		// would destroy the password set during createUser or by the webhook.
		if (userId && password) {
			const { error: pwError } = await supabaseAdmin.auth.admin.updateUserById(userId, { password });
			if (pwError) {
				console.error('[success] Failed to set password:', pwError);
				password = undefined;
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
	return { sessionId, success: true, needsSignIn: true, email };
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
		console.error('[success] Error updating profile to member:', profileError);
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

	if (paymentError) {
		// 23505 = unique violation (already recorded) — that's fine
		if (paymentError.code !== '23505') {
			console.error('[success] Error recording payment:', paymentError);
		}
	}

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
	if (password) {
		const { error } = await supabase.auth.signInWithPassword({ email, password });
		if (!error) return true;
		console.error('[success] Password sign-in failed:', error.message);
	}

	try {
		const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
			type: 'magiclink',
			email
		});

		if (linkError || !linkData?.properties?.hashed_token) {
			console.error('[success] Failed to generate magic link:', linkError?.message);
			return false;
		}

		const { error: verifyError } = await supabase.auth.verifyOtp({
			token_hash: linkData.properties.hashed_token,
			type: 'magiclink'
		});

		if (!verifyError) return true;
		console.error('[success] Magic link verification failed:', verifyError.message);
	} catch (err) {
		console.error('[success] Error during magic link sign-in:', err);
	}

	return false;
}
