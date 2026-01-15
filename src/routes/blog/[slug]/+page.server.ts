import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, locals }) => {
	const { data: post } = await locals.supabase
		.from('blog_posts')
		.select('*')
		.eq('slug', params.slug)
		.eq('is_published', true)
		.single();

	if (!post) {
		throw error(404, 'Post not found');
	}

	return {
		post
	};
};
