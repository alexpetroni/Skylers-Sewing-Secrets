import type { PageServerLoad, Actions } from './$types';
import { createAdminClient } from '$lib/server/supabase';
import { error, fail, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
	const adminClient = createAdminClient();

	const { data: testimonial } = await adminClient
		.from('testimonials')
		.select('*')
		.eq('id', params.id)
		.single();

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

		const adminClient = createAdminClient();

		const { error: updateError } = await adminClient
			.from('testimonials')
			.update({
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
			.eq('id', params.id);

		if (updateError) {
			console.error('Failed to update testimonial:', updateError);
			return fail(500, { error: 'Failed to update testimonial' });
		}

		return { success: true };
	},

	delete: async ({ params }) => {
		const adminClient = createAdminClient();

		const { error: deleteError } = await adminClient
			.from('testimonials')
			.delete()
			.eq('id', params.id);

		if (deleteError) {
			console.error('Failed to delete testimonial:', deleteError);
			return fail(500, { error: 'Failed to delete testimonial' });
		}

		throw redirect(303, '/admin/testimonials');
	}
};
