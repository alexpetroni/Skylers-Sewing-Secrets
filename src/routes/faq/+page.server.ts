import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const { data: faqs } = await locals.supabase
		.from('faq_items')
		.select('*')
		.eq('is_published', true)
		.order('category')
		.order('order_index');

	return {
		faqs: faqs || []
	};
};
