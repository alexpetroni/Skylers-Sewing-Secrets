import type { PageServerLoad, Actions } from './$types';
import { error, fail, redirect } from '@sveltejs/kit';
import { eq, and, ne } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { blog_posts } from '$lib/server/db/schema';

export const load: PageServerLoad = async ({ params }) => {
	let post;
	try {
		[post] = await db.select().from(blog_posts).where(eq(blog_posts.id, params.id)).limit(1);
	} catch (err) {
		console.error('Failed to load blog post:', err);
	}

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

		// Check for duplicate slug (excluding current post)
		let existing;
		try {
			[existing] = await db
				.select({ id: blog_posts.id })
				.from(blog_posts)
				.where(and(eq(blog_posts.slug, slug), ne(blog_posts.id, params.id)))
				.limit(1);
		} catch (err) {
			console.error('Failed to check blog post slug:', err);
		}

		if (existing) {
			return fail(400, { errors: { slug: 'This slug is already in use' } as Record<string, string> });
		}

		// Get current post to check if we need to set published_at
		let currentPost;
		try {
			[currentPost] = await db
				.select({ is_published: blog_posts.is_published, published_at: blog_posts.published_at })
				.from(blog_posts)
				.where(eq(blog_posts.id, params.id))
				.limit(1);
		} catch (err) {
			console.error('Failed to load current blog post:', err);
		}

		const published_at = is_published && !currentPost?.published_at
			? new Date().toISOString()
			: currentPost?.published_at;

		// Update post
		try {
			await db
				.update(blog_posts)
				.set({
					title,
					slug,
					excerpt,
					featured_image_url,
					content,
					is_published,
					published_at: is_published ? published_at : null,
					updated_at: new Date().toISOString()
				})
				.where(eq(blog_posts.id, params.id));
		} catch (err) {
			console.error('Failed to update post:', err);
			return fail(500, { error: 'Failed to update post' });
		}

		return { success: true };
	},

	delete: async ({ params }) => {
		try {
			await db.delete(blog_posts).where(eq(blog_posts.id, params.id));
		} catch (err) {
			console.error('Failed to delete post:', err);
			return fail(500, { error: 'Failed to delete post' });
		}

		throw redirect(303, '/admin/blog');
	}
};
