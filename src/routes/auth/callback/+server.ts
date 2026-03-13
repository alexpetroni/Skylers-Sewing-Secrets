import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createAdminClient } from '$lib/server/supabase';

export const GET: RequestHandler = async ({ url, locals, cookies }) => {
	const code = url.searchParams.get('code');
	// Read redirectTo from URL param first, then from cookie (set before OAuth redirect)
	const redirectTo = url.searchParams.get('redirectTo') || cookies.get('oauth_redirect_to') || '/dashboard';
	cookies.delete('oauth_redirect_to', { path: '/' });

	if (code) {
		const { data, error } = await locals.supabase.auth.exchangeCodeForSession(code);

		if (error) {
			redirect(303, `/auth/sign-in?error=${encodeURIComponent(error.message)}`);
		}

		if (data.user) {
			// Ensure profile exists (DB trigger may not have run)
			const { data: profile } = await locals.supabase
				.from('profiles')
				.select('is_admin')
				.eq('id', data.user.id)
				.single();

			if (!profile) {
				try {
					const supabaseAdmin = createAdminClient();
					await supabaseAdmin.from('profiles').insert({
						id: data.user.id,
						email: data.user.email,
						full_name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || '',
						is_member: false,
						is_admin: false
					});
				} catch (err) {
					console.error('[auth/callback] Failed to create profile:', err);
				}
			}

			if (profile?.is_admin) {
				redirect(303, '/admin');
			}
		}
	}

	redirect(303, redirectTo);
};
