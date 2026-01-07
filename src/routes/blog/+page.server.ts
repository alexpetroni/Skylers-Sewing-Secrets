import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const { data: posts } = await locals.supabase
		.from('blog_posts')
		.select('id, title, slug, excerpt, featured_image_url, published_at, created_at')
		.eq('is_published', true)
		.order('published_at', { ascending: false });

	return {
		posts: posts || []
	};
};
