import type { Session, User as SupabaseUser } from '@supabase/supabase-js';
import type { User } from '$lib/types';

declare global {
	namespace App {
		interface Locals {
			supabase: import('@supabase/supabase-js').SupabaseClient;
			supabaseAdmin: import('@supabase/supabase-js').SupabaseClient;
			safeGetSession: () => Promise<{ session: Session | null; user: SupabaseUser | null }>;
			session: Session | null;
			user: SupabaseUser | null;
			profile: User | null;
		}

		interface PageData {
			session: Session | null;
			user: SupabaseUser | null;
			profile: User | null;
		}

		// interface Error {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
