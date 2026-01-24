import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
	const formData = await request.formData();
	const email = formData.get('email') as string;

	if (!email) {
		return json({ error: 'Email is required' }, { status: 400 });
	}

	// Basic email validation
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	if (!emailRegex.test(email)) {
		return json({ error: 'Please enter a valid email address' }, { status: 400 });
	}

	try {
		// Use supabaseAdmin to bypass RLS for inserting
		const { error } = await locals.supabaseAdmin
			.from('newsletter_subscribers')
			.upsert(
				{ email: email.toLowerCase(), is_active: true, subscribed_at: new Date().toISOString() },
				{ onConflict: 'email' }
			);

		if (error) {
			console.error('Newsletter subscription error:', error);
			return json({ error: 'Failed to subscribe. Please try again.' }, { status: 500 });
		}

		return json({ success: true, message: 'Successfully subscribed!' });
	} catch (err) {
		console.error('Newsletter error:', err);
		return json({ error: 'An error occurred. Please try again.' }, { status: 500 });
	}
};
