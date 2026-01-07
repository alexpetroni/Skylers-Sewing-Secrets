import { createBrowserClient } from '@supabase/ssr';
import { env } from '$env/dynamic/public';

/**
 * Creates a Supabase client for use in the browser.
 * This client uses the publishable key and respects RLS policies.
 */
export function createClient() {
	return createBrowserClient(
		env.PUBLIC_SUPABASE_URL!,
		env.PUBLIC_SUPABASE_PUBLISHABLE_KEY!
	);
}
