import { fail, redirect, isRedirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { and, eq, gt, gte, isNull, lt, lte, or, sql } from 'drizzle-orm';
import { stripe, calculateDiscount } from '$lib/server/stripe';
import { db } from '$lib/server/db';
import { pricing_config, promo_codes, profiles } from '$lib/server/db/schema';
import { env as publicEnv } from '$env/dynamic/public';

/**
 * Conditions the old RLS policy enforced on every promo read:
 * active, inside the validity window, under the usage cap.
 */
function validPromoWhere(id: string) {
	const now = new Date().toISOString();
	return and(
		eq(promo_codes.id, id),
		eq(promo_codes.is_active, true),
		lte(promo_codes.valid_from, now),
		or(isNull(promo_codes.valid_until), gt(promo_codes.valid_until, now)),
		or(isNull(promo_codes.max_uses), lt(promo_codes.current_uses, promo_codes.max_uses))
	);
}

export const load: PageServerLoad = async ({ locals, cookies, url }) => {
	// Redirect if user is already a member
	if (locals.profile?.is_member) {
		redirect(303, locals.profile.is_admin ? '/admin' : '/dashboard');
	}

	// Get active pricing
	const [pricing] = await db
		.select()
		.from(pricing_config)
		.where(eq(pricing_config.is_active, true))
		.limit(1);

	if (!pricing) {
		throw new Error('No active pricing configuration found');
	}

	// Check for applied promo code in session
	const promoCodeId = cookies.get('promo_code_id');
	let appliedPromo = null;
	let finalPrice = pricing.base_price;

	if (promoCodeId) {
		const [promo] = await db.select().from(promo_codes).where(validPromoWhere(promoCodeId)).limit(1);

		if (promo) {
			const { finalPrice: calculated } = calculateDiscount(
				pricing.base_price,
				promo.discount_type,
				promo.discount_value
			);
			appliedPromo = promo;
			finalPrice = calculated;
		}
	}

	const urlError = url.searchParams.get('error');

	// Only consider user as signed in if they have a profile
	// (prevents stale session cookies from hiding the signup form)
	const authenticatedUser = locals.user && locals.profile ? locals.user : null;

	return {
		pricing,
		appliedPromo,
		finalPrice,
		user: authenticatedUser,
		urlError
	};
};

export const actions: Actions = {
	applyPromo: async ({ request, cookies }) => {
		const formData = await request.formData();
		const code = (formData.get('promoCode') as string)?.trim().toUpperCase();

		if (!code) {
			return fail(400, { promoError: 'Please enter a promo code' });
		}

		// Look up promo code
		const now = new Date().toISOString();
		const [promo] = await db
			.select()
			.from(promo_codes)
			.where(
				and(
					eq(promo_codes.code, code),
					eq(promo_codes.is_active, true),
					lte(promo_codes.valid_from, now),
					or(isNull(promo_codes.valid_until), gte(promo_codes.valid_until, now))
				)
			)
			.limit(1);

		if (!promo) {
			return fail(400, { promoError: 'Invalid or expired promo code' });
		}

		// Check usage limit (explicit null check: max_uses = 0 means unusable)
		if (promo.max_uses !== null && promo.current_uses >= promo.max_uses) {
			return fail(400, { promoError: 'This promo code has reached its usage limit' });
		}

		// Store promo code ID in cookie
		cookies.set('promo_code_id', promo.id, {
			path: '/',
			maxAge: 60 * 60, // 1 hour
			httpOnly: true,
			secure: true,
			sameSite: 'lax'
		});

		return { success: true };
	},

	checkout: async ({ request, locals, cookies }) => {
		// Same rule as the load: members never start a second checkout
		if (locals.profile?.is_member) {
			redirect(303, locals.profile.is_admin ? '/admin' : '/dashboard');
		}

		const formData = await request.formData();
		const fullName = ((formData.get('fullName') as string) || '').trim();
		const email = ((formData.get('email') as string) || '').trim().toLowerCase();
		const password = formData.get('password') as string;
		const promoCodeId = formData.get('promoCodeId') as string;

		// If user is not logged in, validate and create account
		if (!locals.user) {
			const errors: Record<string, string> = {};

			if (!fullName || fullName.length < 2) {
				errors.fullName = 'Please enter your full name';
			} else if (fullName.length > 100) {
				errors.fullName = 'Full name must be 100 characters or fewer';
			}

			if (!email) {
				errors.email = 'Email is required';
			} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
				errors.email = 'Please enter a valid email address';
			}

			if (!password) {
				errors.password = 'Password is required';
			} else if (password.length < 8) {
				errors.password = 'Password must be at least 8 characters';
			}

			if (Object.keys(errors).length > 0) {
				return fail(400, { fullName, email, errors });
			}

			// Check if email is already registered (case-insensitive)
			try {
				const [existingProfile] = await db
					.select({ id: profiles.id })
					.from(profiles)
					.where(sql`lower(${profiles.email}) = lower(${email})`)
					.limit(1);

				if (existingProfile) {
					errors.email = 'This email is already registered. Please sign in instead.';
					return fail(400, { fullName, email, errors });
				}
			} catch (err) {
				console.error('[checkout] Duplicate email check failed:', err);
				// Continue with checkout if the check fails
			}

			// Store credentials temporarily in session for after payment
			cookies.set('pending_signup', JSON.stringify({ fullName, email, password }), {
				path: '/',
				maxAge: 60 * 30, // 30 minutes
				httpOnly: true,
				secure: true,
				sameSite: 'lax'
			});
		}

		// Get pricing
		const [pricing] = await db
			.select()
			.from(pricing_config)
			.where(eq(pricing_config.is_active, true))
			.limit(1);

		if (!pricing) {
			return fail(500, { error: 'Pricing configuration not found' });
		}

		let finalPrice = pricing.base_price;
		let promoCode = null;

		// Apply promo code if provided (promoCodeId is client-supplied, so the
		// full validity conditions must be re-checked here)
		if (promoCodeId) {
			const [promo] = await db
				.select()
				.from(promo_codes)
				.where(validPromoWhere(promoCodeId))
				.limit(1);

			if (promo) {
				const { finalPrice: calculated } = calculateDiscount(
					pricing.base_price,
					promo.discount_type,
					promo.discount_value
				);
				finalPrice = calculated;
				promoCode = promo;
			}
		}

		// Create Stripe Checkout session
		try {
			const customerEmail = locals.user?.email || email;

			const session = await stripe.checkout.sessions.create({
				payment_method_types: ['card'],
				line_items: [
					{
						price_data: {
							currency: pricing.currency,
							product_data: {
								name: "Skyler's Sewing Secrets - Lifetime Access",
								description: 'Complete access to all modules, lessons, and resources'
							},
							unit_amount: finalPrice
						},
						quantity: 1
					}
				],
				mode: 'payment',
				customer_email: customerEmail,
				success_url: `${publicEnv.PUBLIC_SITE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
				cancel_url: `${publicEnv.PUBLIC_SITE_URL}/checkout/cancel`,
				metadata: {
					promo_code_id: promoCode?.id || '',
					user_id: locals.user?.id || '',
					pending_signup: locals.user ? '' : 'true',
					full_name: locals.user ? '' : fullName
				}
			});

			if (session.url) {
				redirect(303, session.url);
			}
		} catch (err) {
			// Re-throw redirects - they're not errors
			if (isRedirect(err)) {
				throw err;
			}
			console.error('Stripe error:', err);
			return fail(500, { error: 'Failed to create checkout session. Please try again.' });
		}

		return fail(500, { error: 'Failed to create checkout session' });
	}
};
