import type { Actions, PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';
import { sendEmail, contactNotificationEmail } from '$lib/server/email';
import { env } from '$env/dynamic/private';

export const load: PageServerLoad = async () => {
	return {};
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const formData = await request.formData();
		const name = formData.get('name')?.toString().trim() || '';
		const email = formData.get('email')?.toString().trim() || '';
		const subject = formData.get('subject')?.toString().trim() || '';
		const message = formData.get('message')?.toString().trim() || '';

		const errors: Record<string, string> = {};

		// Validate
		if (!name) {
			errors.name = 'Name is required';
		}

		if (!email) {
			errors.email = 'Email is required';
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			errors.email = 'Please enter a valid email address';
		}

		if (!message) {
			errors.message = 'Message is required';
		} else if (message.length < 10) {
			errors.message = 'Message must be at least 10 characters';
		}

		if (Object.keys(errors).length > 0) {
			return fail(400, {
				errors,
				values: { name, email, subject, message }
			});
		}

		// Save to database
		const { error } = await locals.supabase
			.from('contact_submissions')
			.insert({
				name,
				email,
				subject: subject || null,
				message
			});

		if (error) {
			console.error('Failed to save contact submission:', error);
			return fail(500, {
				error: 'Failed to send message. Please try again later.',
				values: { name, email, subject, message }
			});
		}

		// Send email notification to contact email
		const contactEmail = env.CONTACT_EMAIL || env.ADMIN_EMAIL;
		if (contactEmail) {
			const emailContent = contactNotificationEmail(name, email, subject, message);
			await sendEmail({
				to: contactEmail,
				subject: emailContent.subject,
				html: emailContent.html,
				text: emailContent.text,
				replyTo: email
			});
		}

		return {
			success: true
		};
	}
};
