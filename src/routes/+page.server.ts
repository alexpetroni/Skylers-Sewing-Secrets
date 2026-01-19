import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	// Get published modules for preview with lessons
	const { data: modules } = await locals.supabase
		.from('modules')
		.select(`
			id,
			title,
			slug,
			description,
			thumbnail_url,
			order_index,
			is_published,
			is_bonus,
			lessons (
				id,
				lesson_type,
				duration_minutes,
				is_published
			)
		`)
		.eq('is_published', true)
		.order('order_index');

	// Get featured testimonials
	const { data: testimonials } = await locals.supabase
		.from('testimonials')
		.select('*')
		.eq('is_published', true)
		.eq('is_featured', true)
		.order('order_index')
		.limit(6);

	// Get active pricing
	const { data: pricing } = await locals.supabase
		.from('pricing_config')
		.select('*')
		.eq('is_active', true)
		.single();

	return {
		modules: modules || [],
		testimonials: testimonials || [],
		pricing
	};
};
