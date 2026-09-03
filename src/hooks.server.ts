import { error, redirect, type Handle } from '@sveltejs/kit';
import { building } from '$app/environment';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import { eq } from 'drizzle-orm';
import { getAuth } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { profiles } from '$lib/server/db/schema';
import { ensureProfile } from '$lib/server/users';

export const handle: Handle = async ({ event, resolve }) => {
	// No page needs auth or the database at prerender time, and the auth
	// instance requires runtime env vars — skip it entirely during build.
	if (building) {
		event.locals.session = null;
		event.locals.user = null;
		event.locals.profile = null;
		return resolve(event);
	}

	const auth = getAuth();

	// Better Auth endpoints never read locals — skip the extra session and
	// profile roundtrips and hand the request straight to the handler
	if (event.url.pathname.startsWith('/api/auth/')) {
		event.locals.session = null;
		event.locals.user = null;
		event.locals.profile = null;
		return svelteKitHandler({ event, resolve, auth, building });
	}

	const sessionData = await auth.api.getSession({ headers: event.request.headers });
	event.locals.session = sessionData?.session ?? null;
	event.locals.user = sessionData?.user ?? null;

	if (sessionData?.user) {
		let [profile] = await db
			.select()
			.from(profiles)
			.where(eq(profiles.id, sessionData.user.id))
			.limit(1);

		if (!profile) {
			try {
				await ensureProfile({
					userId: sessionData.user.id,
					email: sessionData.user.email,
					fullName: sessionData.user.name
				});
				[profile] = await db
					.select()
					.from(profiles)
					.where(eq(profiles.id, sessionData.user.id))
					.limit(1);
			} catch (err) {
				console.error('[hooks] failed to self-heal missing profile', err);
			}
		}

		event.locals.profile = profile ?? null;
	} else {
		event.locals.profile = null;
	}

	// SvelteKit runs form actions before layout loads, so the layout guard
	// alone does not protect POSTs — gate every /admin request here too.
	if (event.url.pathname === '/admin' || event.url.pathname.startsWith('/admin/')) {
		const isReadMethod = event.request.method === 'GET' || event.request.method === 'HEAD';

		if (!event.locals.user) {
			if (isReadMethod) {
				redirect(303, `/auth/sign-in?redirectTo=${encodeURIComponent(event.url.pathname)}`);
			}
			error(401, 'Unauthorized');
		}

		if (!event.locals.profile?.is_admin) {
			if (isReadMethod) {
				redirect(303, '/');
			}
			error(403, 'Forbidden');
		}
	}

	// Serves all /api/auth/* endpoints (sign-in, Google OAuth callback, etc.)
	return svelteKitHandler({ event, resolve, auth, building });
};
