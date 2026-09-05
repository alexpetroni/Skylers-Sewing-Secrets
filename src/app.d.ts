import type { AuthSession, AuthUser } from '$lib/server/auth';
import type { User } from '$lib/types';

declare global {
	namespace App {
		interface Locals {
			session: AuthSession | null;
			user: AuthUser | null;
			profile: User | null;
		}

		interface PageData {
			user: AuthUser | null;
			profile: User | null;
		}

		// interface Error {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
