import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { Cookies } from '@sveltejs/kit';
import { env as publicEnv } from '$env/dynamic/public';
import { env as privateEnv } from '$env/dynamic/private';

/**
 * Creates a Supabase client for server-side use with cookie handling.
 * This client respects RLS policies based on the user's session.
 */
export function createServerSupabaseClient(cookies: Cookies) {
	return createServerClient(
		publicEnv.PUBLIC_SUPABASE_URL!,
		publicEnv.PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
		{
			cookies: {
				getAll() {
					return cookies.getAll();
				},
				setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
					cookiesToSet.forEach(({ name, value, options }) => {
						cookies.set(name, value, { ...options, path: '/' });
					});
				}
			}
		}
	);
}

/**
 * Creates an admin Supabase client with the secret key.
 * This client bypasses RLS policies - use with caution!
 */
export function createAdminClient() {
	return createSupabaseClient(
		publicEnv.PUBLIC_SUPABASE_URL!,
		privateEnv.SUPABASE_SECRET_KEY!,
		{
			auth: {
				autoRefreshToken: false,
				persistSession: false
			}
		}
	);
}
