import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, locals }) => {
	const code = url.searchParams.get('code');
	const redirectTo = url.searchParams.get('redirectTo') || '/dashboard';

	if (code) {
		const { error } = await locals.supabase.auth.exchangeCodeForSession(code);
		
		if (error) {
			redirect(303, `/auth/sign-in?error=${encodeURIComponent(error.message)}`);
		}
	}

	redirect(303, redirectTo);
};
