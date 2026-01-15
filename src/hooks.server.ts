import type { Handle } from '@sveltejs/kit';
import { createServerSupabaseClient, createAdminClient } from '$lib/server/supabase';

export const handle: Handle = async ({ event, resolve }) => {
	// Create Supabase clients
	event.locals.supabase = createServerSupabaseClient(event.cookies);
	event.locals.supabaseAdmin = createAdminClient();

	/**
	 * Safely get the session from Supabase.
	 * This validates the JWT and returns the session if valid.
	 */
	event.locals.safeGetSession = async () => {
		const {
			data: { session }
		} = await event.locals.supabase.auth.getSession();

		if (!session) {
			return { session: null, user: null };
		}

		// Validate the JWT by getting claims
		const {
			data: { user },
			error
		} = await event.locals.supabase.auth.getUser();

		if (error || !user) {
			return { session: null, user: null };
		}

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
