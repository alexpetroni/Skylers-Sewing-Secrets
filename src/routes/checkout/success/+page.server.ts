import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, locals }) => {
	const sessionId = url.searchParams.get('session_id');

	// In a real app, you might verify the session with Stripe
	// For now, just check if user is authenticated and is a member
	
	if (!locals.user) {
		redirect(303, '/auth/sign-in');
	}

	return {
		sessionId
	};
};
