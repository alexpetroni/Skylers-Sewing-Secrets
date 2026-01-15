import type { PageServerLoad, Actions } from './$types';
import { createAdminClient } from '$lib/server/supabase';
import { error, fail, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
	const adminClient = createAdminClient();

	const { data: post } = await adminClient
		.from('blog_posts')
		.select('*')
		.eq('id', params.id)
		.single();

	if (!post) {
		throw error(404, 'Post not found');
	}

	return {
		post
	};
};

export const actions: Actions = {
	update: async ({ params, request }) => {
		const formData = await request.formData();
		
		const title = formData.get('title')?.toString().trim() || '';
		const slug = formData.get('slug')?.toString().trim() || '';
		const excerpt = formData.get('excerpt')?.toString().trim() || null;
		const featured_image_url = formData.get('featured_image_url')?.toString().trim() || null;
		const content = formData.get('content')?.toString().trim() || '';
		const is_published = formData.get('is_published') === 'on';

		const errors: Record<string, string> = {};

		if (!title) errors.title = 'Title is required';
		if (!slug) errors.slug = 'Slug is required';
		if (!/^[a-z0-9-]+$/.test(slug)) errors.slug = 'Slug must be lowercase letters, numbers, and hyphens only';
		if (!content) errors.content = 'Content is required';

		if (Object.keys(errors).length > 0) {
			return fail(400, { errors });
		}

		const adminClient = createAdminClient();

		// Check for duplicate slug (excluding current post)
		const { data: existing } = await adminClient
			.from('blog_posts')
			.select('id')
			.eq('slug', slug)
			.neq('id', params.id)
			.single();

		if (existing) {
			return fail(400, { errors: { slug: 'This slug is already in use' } as Record<string, string> });
		}

		// Get current post to check if we need to set published_at
		const { data: currentPost } = await adminClient
			.from('blog_posts')
			.select('is_published, published_at')
			.eq('id', params.id)
			.single();

		const published_at = is_published && !currentPost?.published_at 
			? new Date().toISOString() 
			: currentPost?.published_at;

		// Update post
		const { error: updateError } = await adminClient
			.from('blog_posts')
			.update({
				title,
				slug,
				excerpt,
				featured_image_url,
				content,
				is_published,
				published_at: is_published ? published_at : null,
				updated_at: new Date().toISOString()
			})
			.eq('id', params.id);

		if (updateError) {
			console.error('Failed to update post:', updateError);
			return fail(500, { error: 'Failed to update post' });
		}

		return { success: true };
	},

	delete: async ({ params }) => {
		const adminClient = createAdminClient();

		const { error: deleteError } = await adminClient
			.from('blog_posts')
			.delete()
			.eq('id', params.id);

		if (deleteError) {
			console.error('Failed to delete post:', deleteError);
			return fail(500, { error: 'Failed to delete post' });
		}

		throw redirect(303, '/admin/blog');
	}
};
