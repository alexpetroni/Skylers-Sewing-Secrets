import type { Actions } from './$types';
import { createAdminClient } from '$lib/server/supabase';
import { fail, redirect } from '@sveltejs/kit';

export const actions: Actions = {
	default: async ({ request, locals }) => {
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

		// Check for duplicate slug
		const { data: existing } = await adminClient
			.from('blog_posts')
			.select('id')
			.eq('slug', slug)
			.single();

		if (existing) {
			return fail(400, { errors: { slug: 'This slug is already in use' } });
		}

		// Create post
		const { data: post, error } = await adminClient
			.from('blog_posts')
			.insert({
				title,
				slug,
				excerpt,
				featured_image_url,
				content,
				is_published,
				published_at: is_published ? new Date().toISOString() : null,
				author_id: locals.user?.id
			})
			.select()
			.single();

		if (error) {
			console.error('Failed to create post:', error);
			return fail(500, { error: 'Failed to create post' });
		}

		throw redirect(303, `/admin/blog/${post.id}`);
	}
};
