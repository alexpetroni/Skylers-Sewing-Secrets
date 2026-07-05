import type { PageServerLoad, Actions } from './$types';
import { error, fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { faq_items } from '$lib/server/db/schema';

export const load: PageServerLoad = async ({ params }) => {
	let faq;
	try {
		[faq] = await db.select().from(faq_items).where(eq(faq_items.id, params.id)).limit(1);
	} catch (err) {
		console.error('Failed to load FAQ:', err);
	}

	if (!faq) {
		throw error(404, 'FAQ not found');
	}

	return {
		faq
	};
};

export const actions: Actions = {
	update: async ({ params, request }) => {
		const formData = await request.formData();

		const question = formData.get('question')?.toString().trim() || '';
		const answer = formData.get('answer')?.toString().trim() || '';
		const category = formData.get('category')?.toString().trim() || null;
		const order_index = parseInt(formData.get('order_index')?.toString() || '1', 10);
		const is_published = formData.get('is_published') === 'on';

		const errors: Record<string, string> = {};

		if (!question) errors.question = 'Question is required';
		if (!answer) errors.answer = 'Answer is required';

		if (Object.keys(errors).length > 0) {
			return fail(400, { errors });
		}

		try {
			await db
				.update(faq_items)
				.set({
					question,
					answer,
					category,
					order_index,
					is_published,
					updated_at: new Date().toISOString()
				})
				.where(eq(faq_items.id, params.id));
		} catch (err) {
			console.error('Failed to update FAQ:', err);
			return fail(500, { error: 'Failed to update FAQ' });
		}

		return { success: true };
	},

	delete: async ({ params }) => {
		try {
			await db.delete(faq_items).where(eq(faq_items.id, params.id));
		} catch (err) {
			console.error('Failed to delete FAQ:', err);
			return fail(500, { error: 'Failed to delete FAQ' });
		}

		throw redirect(303, '/admin/faq');
	}
};
