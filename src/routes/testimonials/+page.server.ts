import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const { data: testimonials } = await locals.supabase
		.from('testimonials')
		.select('*')
		.eq('is_published', true)
		.order('order_index');

	return {
		testimonials: testimonials || []
	};
};
