import type { PageServerLoad, Actions } from './$types';
import { createAdminClient } from '$lib/server/supabase';
import { fail, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async () => {
	const adminClient = createAdminClient();

	const { data: testimonials } = await adminClient
		.from('testimonials')
		.select('order_index')
		.order('order_index', { ascending: false })
		.limit(1);

	const nextOrderIndex = (testimonials?.[0]?.order_index || 0) + 1;

	return {
		nextOrderIndex
	};
};

export const actions: Actions = {
	default: async ({ request }) => {
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

		const adminClient = createAdminClient();

		const { data: testimonial, error } = await adminClient
			.from('testimonials')
			.insert({
				author_name,
				author_title,
				country,
				author_avatar_url,
				content,
				rating,
				order_index,
				is_published,
				is_featured
			})
			.select()
			.single();

		if (error) {
			console.error('Failed to create testimonial:', error);
			return fail(500, { error: 'Failed to create testimonial' });
		}

		throw redirect(303, `/admin/testimonials/${testimonial.id}`);
	}
};
