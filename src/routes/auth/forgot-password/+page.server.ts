import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import { env } from '$env/dynamic/public';

export const actions: Actions = {
	default: async ({ request, locals }) => {
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

		const { error } = await locals.supabase.auth.resetPasswordForEmail(email, {
			redirectTo: `${env.PUBLIC_SITE_URL}/auth/reset-password`
		});

		if (error) {
			return fail(400, {
				email,
				error: error.message
			});
		}

		return { success: true };
	}
};
