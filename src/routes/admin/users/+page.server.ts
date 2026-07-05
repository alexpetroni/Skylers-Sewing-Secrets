import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { eq, desc } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { profiles } from '$lib/server/db/schema';
import { getAuth } from '$lib/server/auth';

export const load: PageServerLoad = async () => {
	try {
		const users = await db.select().from(profiles).orderBy(desc(profiles.created_at));

		return {
			users
		};
	} catch (err) {
		console.error('Failed to load users:', err);
		return {
			users: []
		};
	}
};

export const actions: Actions = {
	toggleSuspend: async ({ request }) => {
		const formData = await request.formData();
		const userId = formData.get('userId')?.toString();
		const suspend = formData.get('suspend')?.toString() === 'true';

		if (!userId) {
			return fail(400, { error: 'User ID is required' });
		}

		try {
			await db.update(profiles).set({ is_suspended: suspend }).where(eq(profiles.id, userId));
		} catch (err) {
			console.error('Failed to update user suspension status:', err);
			return fail(500, { error: 'Failed to update user' });
		}

		return { success: true };
	},

	resetPassword: async ({ request }) => {
		const formData = await request.formData();
		const email = formData.get('email')?.toString();

		if (!email) {
			return fail(400, { error: 'Email is required' });
		}

		try {
			// Better Auth generates the token and sends the reset email itself
			// (via the configured Resend template in sendResetPassword)
			await getAuth().api.requestPasswordReset({
				body: { email, redirectTo: '/auth/reset-password' }
			});
		} catch (err) {
			console.error('Failed to send password reset email:', err);
			return fail(500, { error: 'Failed to send password reset email' });
		}

		return { success: true };
	}
};
