import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	// User must have a valid session (from the recovery code exchange)
	if (!locals.user) {
		redirect(303, '/auth/forgot-password');
	}
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		if (!locals.user) {
			redirect(303, '/auth/forgot-password');
		}

		const formData = await request.formData();
		const password = formData.get('password') as string;
		const confirmPassword = formData.get('confirmPassword') as string;

		const errors: Record<string, string> = {};

		if (!password) {
			errors.password = 'Password is required';
		} else if (password.length < 8) {
			errors.password = 'Password must be at least 8 characters';
		}

		if (!confirmPassword) {
			errors.confirmPassword = 'Please confirm your password';
		} else if (password !== confirmPassword) {
			errors.confirmPassword = 'Passwords do not match';
		}

		if (Object.keys(errors).length > 0) {
			return fail(400, { errors });
		}

		const { error } = await locals.supabase.auth.updateUser({ password });

		if (error) {
			return fail(400, { error: error.message });
		}

		return { success: true };
	}
};
