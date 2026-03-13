import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/public';

export const POST: RequestHandler = async ({ request, locals, cookies }) => {
	const formData = await request.formData();
	const provider = formData.get('provider') as 'google';
	const redirectTo = formData.get('redirectTo') as string || '/dashboard';

	// Store redirectTo in cookie so it survives the OAuth redirect chain
	cookies.set('oauth_redirect_to', redirectTo, {
		path: '/',
		maxAge: 60 * 10, // 10 minutes
		httpOnly: true,
		secure: true,
		sameSite: 'lax'
	});

	const { data, error } = await locals.supabase.auth.signInWithOAuth({
		provider,
		options: {
			redirectTo: `${env.PUBLIC_SITE_URL}/auth/callback?redirectTo=${encodeURIComponent(redirectTo)}`
		}
	});

	if (error) {
		redirect(303, `/auth/sign-in?error=${encodeURIComponent(error.message)}`);
	}

	if (data.url) {
		redirect(303, data.url);
	}

	redirect(303, '/auth/sign-in');
};
