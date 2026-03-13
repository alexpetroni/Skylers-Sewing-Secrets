import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import { env } from '$env/dynamic/public';
import { createAdminClient } from '$lib/server/supabase';
import { sendEmail, passwordResetEmail } from '$lib/server/email';

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const formData = await request.formData();
		const email = formData.get('email') as string;

		// Validation
		if (!email) {
			return fail(400, {
				email,
				errors: { email: 'Email is required' }
			});
		}

		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			return fail(400, {
				email,
				errors: { email: 'Please enter a valid email address' }
			});
		}

		const supabaseAdmin = createAdminClient();

		// Check if email exists in profiles
		const { data: existingProfile } = await supabaseAdmin
			.from('profiles')
			.select('id')
			.ilike('email', email)
			.maybeSingle();

		if (!existingProfile) {
			return fail(400, {
				email,
				errors: { email: 'No account found with this email address' }
			});
		}

		// Generate recovery link via admin API (bypasses Supabase email template)
		const siteUrl = env.PUBLIC_SITE_URL || 'https://skylersewingsecrets.com';
		const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
			type: 'recovery',
			email,
			options: {
				redirectTo: `${siteUrl}/auth/callback?type=recovery`
			}
		});

		if (linkError || !linkData?.properties?.action_link) {
			console.error('[forgot-password] generateLink error:', linkError);
			return fail(400, {
				email,
				error: 'Failed to generate reset link. Please try again.'
			});
		}

		// Send custom email via Resend with the proper recovery link
		const template = passwordResetEmail(linkData.properties.action_link);
		const emailResult = await sendEmail({
			to: email.toLowerCase(),
			subject: template.subject,
			html: template.html,
			text: template.text
		});

		if (!emailResult.success) {
			console.error('[forgot-password] Failed to send email:', emailResult.error);
			return fail(400, {
				email,
				error: 'Failed to send reset email. Please try again.'
			});
		}

		// Set cookie so callback knows to redirect to reset-password
		cookies.set('password_reset_pending', 'true', {
			path: '/',
			maxAge: 60 * 10,
			httpOnly: true,
			secure: true,
			sameSite: 'lax'
		});

		return { success: true };
	}
};
