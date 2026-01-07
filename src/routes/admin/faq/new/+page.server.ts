import type { PageServerLoad, Actions } from './$types';
import { createAdminClient } from '$lib/server/supabase';
import { fail, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async () => {
	const adminClient = createAdminClient();

	const { data: faqs } = await adminClient
		.from('faq_items')
		.select('order_index')
		.order('order_index', { ascending: false })
		.limit(1);

	const nextOrderIndex = (faqs?.[0]?.order_index || 0) + 1;

	return {
		nextOrderIndex
	};
};

export const actions: Actions = {
	default: async ({ request }) => {
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

		const { data: faq, error } = await adminClient
			.from('faq_items')
			.insert({
				question,
				answer,
				category,
				order_index,
				is_published
			})
			.select()
			.single();

		if (error) {
			console.error('Failed to create FAQ:', error);
			return fail(500, { error: 'Failed to create FAQ' });
		}

		throw redirect(303, `/admin/faq/${faq.id}`);
	}
};
