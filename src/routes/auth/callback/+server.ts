import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, locals }) => {
	const code = url.searchParams.get('code');
	const redirectTo = url.searchParams.get('redirectTo') || '/dashboard';

	if (code) {
		const { data, error } = await locals.supabase.auth.exchangeCodeForSession(code);

		if (error) {
			redirect(303, `/auth/sign-in?error=${encodeURIComponent(error.message)}`);
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
	}

	redirect(303, redirectTo);
};
