import type { PageServerLoad, Actions } from './$types';
import { error, fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { testimonials } from '$lib/server/db/schema';

export const load: PageServerLoad = async ({ params }) => {
	let testimonial;
	try {
		[testimonial] = await db.select().from(testimonials).where(eq(testimonials.id, params.id)).limit(1);
	} catch (err) {
		console.error('Failed to load testimonial:', err);
	}

	if (!testimonial) {
		throw error(404, 'Testimonial not found');
	}

	return {
		testimonial
	};
};

export const actions: Actions = {
	update: async ({ params, request }) => {
		const formData = await request.formData();

		const author_name = formData.get('author_name')?.toString().trim() || '';
		const author_title = formData.get('author_title')?.toString().trim() || null;
		const country = formData.get('country')?.toString().trim() || null;
		const author_avatar_url = formData.get('author_avatar_url')?.toString().trim() || null;
		const content = formData.get('content')?.toString().trim() || '';
		const rating = parseInt(formData.get('rating')?.toString() || '5', 10);
		const order_index = parseInt(formData.get('order_index')?.toString() || '1', 10);
		const is_published = formData.get('is_published') === 'on';
		const is_featured = formData.get('is_featured') === 'on';

		const errors: Record<string, string> = {};

		if (!author_name) errors.author_name = 'Author name is required';
		if (!content) errors.content = 'Content is required';

		if (Object.keys(errors).length > 0) {
			return fail(400, { errors });
		}

		try {
			await db
				.update(testimonials)
				.set({
					author_name,
					author_title,
					country,
					author_avatar_url,
					content,
					rating,
					order_index,
					is_published,
					is_featured,
					updated_at: new Date().toISOString()
				})
				.where(eq(testimonials.id, params.id));
		} catch (err) {
			console.error('Failed to update testimonial:', err);
			return fail(500, { error: 'Failed to update testimonial' });
		}

		return { success: true };
	},

	delete: async ({ params }) => {
		try {
			await db.delete(testimonials).where(eq(testimonials.id, params.id));
		} catch (err) {
			console.error('Failed to delete testimonial:', err);
			return fail(500, { error: 'Failed to delete testimonial' });
		}

		throw redirect(303, '/admin/testimonials');
	}
};
