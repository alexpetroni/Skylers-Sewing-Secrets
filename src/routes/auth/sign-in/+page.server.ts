import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	// Redirect if already logged in
	if (locals.user && locals.profile) {
		if (locals.profile.is_admin) {
			redirect(303, '/admin');
		} else if (locals.profile.is_member) {
			redirect(303, '/dashboard');
		}
	}

	return {
		redirectTo: url.searchParams.get('redirectTo') || '/dashboard'
	};
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const formData = await request.formData();
		const email = formData.get('email') as string;
		const password = formData.get('password') as string;
		const redirectTo = formData.get('redirectTo') as string || '/dashboard';

		// Validation
		const errors: Record<string, string> = {};
		
		if (!email) {
			errors.email = 'Email is required';
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			errors.email = 'Please enter a valid email address';
		}

		if (!password) {
			errors.password = 'Password is required';
		}

		if (Object.keys(errors).length > 0) {
			return fail(400, { email, errors });
		}

		// Attempt sign in
		const { data, error } = await locals.supabase.auth.signInWithPassword({
			email,
			password
		});

		if (error) {
			return fail(400, {
				email,
				error: 'Invalid email or password'
			});
		}

		// Check if user is admin to redirect appropriately
		if (data.user) {
			const { data: profile } = await locals.supabase
				.from('profiles')
				.select('is_admin')
				.eq('id', data.user.id)
				.single();

			if (profile?.is_admin) {
				redirect(303, '/admin');
			}
		}

		redirect(303, redirectTo);
	}
};
