import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

/**
 * Post-login router, used as the OAuth callbackURL. Replaces the role-based
 * redirect the old Supabase /auth/callback handler performed.
 */
export const GET: RequestHandler = async ({ url, locals }) => {
	const to = url.searchParams.get('to') || '/dashboard';

	if (!locals.user) {
		redirect(303, '/auth/sign-in');
	}

	if (locals.profile?.is_admin) {
		redirect(303, '/admin');
	}

	// Only allow same-origin relative targets
	const target = to.startsWith('/') && !to.startsWith('//') ? to : '/dashboard';
	redirect(303, target);
};
