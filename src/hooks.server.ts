import type { Handle } from '@sveltejs/kit';
import { createServerSupabaseClient, createAdminClient } from '$lib/server/supabase';

export const handle: Handle = async ({ event, resolve }) => {
	// If we have an auth code in the URL, redirect to the callback handler
	const code = event.url.searchParams.get('code');
	if (code && !event.url.pathname.startsWith('/auth/callback')) {
		const redirectUrl = new URL('/auth/callback', event.url.origin);
		// Preserve all query parameters (code, redirectTo, etc.)
		for (const [key, value] of event.url.searchParams) {
			redirectUrl.searchParams.set(key, value);
		}
		return new Response(null, {
			status: 303,
			headers: { Location: redirectUrl.toString() }
		});
	}

	// Create Supabase clients
	event.locals.supabase = createServerSupabaseClient(event.cookies);
	event.locals.supabaseAdmin = createAdminClient();

	/**
	 * Safely get the session from Supabase.
	 * Calls getUser() first to authenticate against the Supabase Auth server,
	 * then retrieves the session only if the user is valid.
	 */
	event.locals.safeGetSession = async () => {
		const {
			data: { user },
			error
		} = await event.locals.supabase.auth.getUser();

		if (error || !user) {
			return { session: null, user: null };
		}

		const {
			data: { session }
		} = await event.locals.supabase.auth.getSession();

		return { session, user };
	};

	// Get session and user
	const { session, user } = await event.locals.safeGetSession();
	event.locals.session = session;
	event.locals.user = user;

	// Get profile if user is authenticated
	if (user) {
		const { data: profile } = await event.locals.supabase
			.from('profiles')
			.select('*')
			.eq('id', user.id)
			.single();

		event.locals.profile = profile;
	} else {
		event.locals.profile = null;
	}

	return resolve(event, {
		filterSerializedResponseHeaders(name) {
			return name === 'content-range' || name === 'x-supabase-api-version';
		}
	});
};
