import { redirect } from '@sveltejs/kit';
import type { User } from '$lib/types';

/**
 * Requires the user to be authenticated.
 * Redirects to sign-in page if not authenticated.
 */
export function requireAuth(
	user: App.Locals['user'],
	redirectTo?: string
): asserts user is NonNullable<App.Locals['user']> {
	if (!user) {
		const params = redirectTo ? `?redirectTo=${encodeURIComponent(redirectTo)}` : '';
		redirect(303, `/auth/sign-in${params}`);
	}
}

/**
 * Requires the user to be a paying member.
 * Redirects to checkout if authenticated but not a member.
 */
export function requireMember(
	user: App.Locals['user'],
	profile: User | null,
	redirectTo?: string
): asserts profile is User {
	requireAuth(user, redirectTo);
	
	if (!profile?.is_member) {
		const params = redirectTo ? `?redirectTo=${encodeURIComponent(redirectTo)}` : '';
		redirect(303, `/checkout${params}`);
	}

	if (profile.is_suspended) {
		redirect(303, '/account-suspended');
	}
}

/**
 * Requires the user to be an admin.
 * Returns 403 if not an admin.
 */
export function requireAdmin(
	user: App.Locals['user'],
	profile: User | null
): asserts profile is User {
	requireAuth(user);
	
	if (!profile?.is_admin) {
		redirect(303, '/');
	}
}

/**
 * Redirects authenticated users away from auth pages.
 */
export function redirectIfAuthenticated(
	user: App.Locals['user'],
	profile: User | null,
	defaultRedirect = '/'
) {
	if (user && profile?.is_member) {
		redirect(303, '/dashboard');
	}
	if (user) {
		redirect(303, defaultRedirect);
	}
}
