import type { PageServerLoad, Actions } from './$types';
import { createAdminClient } from '$lib/server/supabase';
import { fail } from '@sveltejs/kit';
import { sendEmail, passwordResetEmail } from '$lib/server/email';

export const load: PageServerLoad = async () => {
	const adminClient = createAdminClient();

	const { data: users } = await adminClient
		.from('profiles')
		.select('*')
		.order('created_at', { ascending: false });

	return {
		users: users || []
	};
};

export const actions: Actions = {
	toggleSuspend: async ({ request }) => {
		const formData = await request.formData();
		const userId = formData.get('userId')?.toString();
		const suspend = formData.get('suspend')?.toString() === 'true';

		if (!userId) {
			return fail(400, { error: 'User ID is required' });
		}

		const adminClient = createAdminClient();

		const { error } = await adminClient
			.from('profiles')
			.update({ is_suspended: suspend })
			.eq('id', userId);

		if (error) {
			console.error('Failed to update user suspension status:', error);
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

		const adminClient = createAdminClient();

		// Use Supabase Auth admin API to generate password reset link
		const { data, error } = await adminClient.auth.admin.generateLink({
			type: 'recovery',
			email
		});

		if (error) {
			console.error('Failed to generate password reset link:', error);
			return fail(500, { error: 'Failed to send password reset email' });
		}

		// Send the email via Resend with the recovery link
		if (data?.properties?.action_link) {
			const emailContent = passwordResetEmail(data.properties.action_link);
			const result = await sendEmail({
				to: email,
				subject: emailContent.subject,
				html: emailContent.html,
				text: emailContent.text
			});

			if (!result.success) {
				console.error('Failed to send password reset email:', result.error);
				return fail(500, { error: 'Failed to send password reset email' });
			}
		}

		return { success: true };
	}
};
