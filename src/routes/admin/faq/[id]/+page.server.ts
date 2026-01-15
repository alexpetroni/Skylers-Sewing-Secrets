import type { PageServerLoad, Actions } from './$types';
import { createAdminClient } from '$lib/server/supabase';
import { error, fail, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
	const adminClient = createAdminClient();

	const { data: faq } = await adminClient
		.from('faq_items')
		.select('*')
		.eq('id', params.id)
		.single();

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

		const adminClient = createAdminClient();

		const { error: updateError } = await adminClient
			.from('faq_items')
			.update({
				question,
				answer,
				category,
				order_index,
				is_published,
				updated_at: new Date().toISOString()
			})
			.eq('id', params.id);

		if (updateError) {
			console.error('Failed to update FAQ:', updateError);
			return fail(500, { error: 'Failed to update FAQ' });
		}

		return { success: true };
	},

	delete: async ({ params }) => {
		const adminClient = createAdminClient();

		const { error: deleteError } = await adminClient
			.from('faq_items')
			.delete()
			.eq('id', params.id);

		if (deleteError) {
			console.error('Failed to delete FAQ:', deleteError);
			return fail(500, { error: 'Failed to delete FAQ' });
		}

		throw redirect(303, '/admin/faq');
	}
};
