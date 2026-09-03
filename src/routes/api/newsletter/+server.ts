import { json } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';
import { sendEmail, newsletterWelcomeEmail } from '$lib/server/email';
import { db } from '$lib/server/db';
import { newsletter_subscribers } from '$lib/server/db/schema';

export const POST: RequestHandler = async ({ request }) => {
	const formData = await request.formData();
	const rawEmail = formData.get('email') as string;

	if (!rawEmail) {
		return json({ error: 'Email is required' }, { status: 400 });
	}

	const email = rawEmail.trim().toLowerCase();

	// Basic email validation
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	if (!emailRegex.test(email)) {
		return json({ error: 'Please enter a valid email address' }, { status: 400 });
	}

	try {
		const [existing] = await db
			.select({ is_active: newsletter_subscribers.is_active })
			.from(newsletter_subscribers)
			.where(eq(newsletter_subscribers.email, email))
			.limit(1);

		if (existing?.is_active === true) {
			return json({ success: true, message: 'Successfully subscribed!' });
		}

		try {
			const subscribedAt = new Date().toISOString();
			await db
				.insert(newsletter_subscribers)
				.values({ email, is_active: true, subscribed_at: subscribedAt })
				.onConflictDoUpdate({
					target: newsletter_subscribers.email,
					set: { is_active: true, subscribed_at: subscribedAt, unsubscribed_at: null }
				});
		} catch (err) {
			console.error('Newsletter subscription error:', err);
			return json({ error: 'Failed to subscribe. Please try again.' }, { status: 500 });
		}

		// Send welcome email
		console.error('[newsletter] Subscription saved, sending welcome email to:', email);
		const template = newsletterWelcomeEmail();
		const emailResult = await sendEmail({
			to: email,
			subject: template.subject,
			html: template.html,
			text: template.text
		});

		if (!emailResult.success) {
			console.error('[newsletter] Failed to send welcome email:', emailResult.error);
		}

		return json({ success: true, message: 'Successfully subscribed!' });
	} catch (err) {
		console.error('Newsletter error:', err);
		return json({ error: 'An error occurred. Please try again.' }, { status: 500 });
	}
};
