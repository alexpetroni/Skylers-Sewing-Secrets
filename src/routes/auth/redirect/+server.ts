import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { safeRelativeTarget } from '$lib/server/redirects';

/**
 * Post-login router, used as the OAuth callbackURL. Replaces the role-based
 * redirect the old Supabase /auth/callback handler performed.
 */
export const GET: RequestHandler = async ({ url, locals }) => {
	if (!locals.user) {
		redirect(303, '/auth/sign-in');
	}

	if (locals.profile?.is_admin) {
		redirect(303, '/admin');
	}

	redirect(303, safeRelativeTarget(url.searchParams.get('to')));
};
