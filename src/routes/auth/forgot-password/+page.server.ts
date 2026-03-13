import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import { env } from '$env/dynamic/public';
import { createAdminClient } from '$lib/server/supabase';

export const actions: Actions = {
	default: async ({ request, locals, cookies }) => {
		const formData = await request.formData();
		const email = formData.get('email') as string;

		// Validation
		if (!email) {
			return fail(400, {
				email,
				errors: { email: 'Email is required' }
			});
		}

		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			return fail(400, {
				email,
				errors: { email: 'Please enter a valid email address' }
			});
		}

		// Check if email exists in profiles
		try {
			const supabaseAdmin = createAdminClient();
			const { data: existingProfile } = await supabaseAdmin
				.from('profiles')
				.select('id')
				.ilike('email', email)
				.maybeSingle();

			if (!existingProfile) {
				return fail(400, {
					email,
					errors: { email: 'No account found with this email address' }
				});
			}
		} catch (err) {
			console.error('[forgot-password] Email check failed:', err);
		}

		const { error } = await locals.supabase.auth.resetPasswordForEmail(email, {
			redirectTo: `${env.PUBLIC_SITE_URL}/auth/callback?type=recovery`
		});

		if (error) {
			return fail(400, {
				email,
				error: error.message
			});
		}

		// Set cookie so callback knows to redirect to reset-password
		cookies.set('password_reset_pending', 'true', {
			path: '/',
			maxAge: 60 * 10,
			httpOnly: true,
			secure: true,
			sameSite: 'lax'
		});

		return { success: true };
	}
};
