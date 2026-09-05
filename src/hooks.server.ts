import { error, redirect, type Handle } from '@sveltejs/kit';
import { building } from '$app/environment';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import { eq } from 'drizzle-orm';
import { getAuth } from '$lib/server/auth';
import { isActiveAdmin } from '$lib/server/access';
import { db } from '$lib/server/db';
import { profiles } from '$lib/server/db/schema';
import { ensureProfile } from '$lib/server/users';

// Baseline security headers on every response. Headers are only set when
// absent so a route can still override one deliberately. No
// CSP yet (it needs allow-lists for fonts, the Bunny
// iframe and the CDN), and Permissions-Policy leaves autoplay, fullscreen
// and picture-in-picture alone because the lesson player's iframe uses them.
function withSecurityHeaders(response: Response, url: URL): Response {
	const headers = response.headers;
	const setIfAbsent = (name: string, value: string) => {
		if (!headers.has(name)) headers.set(name, value);
	};

	setIfAbsent('X-Content-Type-Options', 'nosniff');
	setIfAbsent('Referrer-Policy', 'strict-origin-when-cross-origin');
	setIfAbsent('X-Frame-Options', 'DENY');
	setIfAbsent('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

	// HSTS is only meaningful (and only safe) over https
	if (url.protocol === 'https:') {
		setIfAbsent('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
	}

	return response;
}

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
		return withSecurityHeaders(
			await svelteKitHandler({ event, resolve, auth, building }),
			event.url
		);
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
	// A suspended admin is not an admin.
	if (event.url.pathname === '/admin' || event.url.pathname.startsWith('/admin/')) {
		const isReadMethod = event.request.method === 'GET' || event.request.method === 'HEAD';

		if (!event.locals.user) {
			if (isReadMethod) {
				redirect(303, `/auth/sign-in?redirectTo=${encodeURIComponent(event.url.pathname)}`);
			}
			error(401, 'Unauthorized');
		}

		if (!isActiveAdmin(event.locals.profile)) {
			if (isReadMethod) {
				redirect(303, '/');
			}
			error(403, 'Forbidden');
		}
	}

	// Serves all /api/auth/* endpoints (sign-in, Google OAuth callback, etc.)
	return withSecurityHeaders(
		await svelteKitHandler({ event, resolve, auth, building }),
		event.url
	);
};
