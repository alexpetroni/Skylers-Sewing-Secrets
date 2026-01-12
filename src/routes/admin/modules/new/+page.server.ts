import type { PageServerLoad, Actions } from './$types';
import { createAdminClient } from '$lib/server/supabase';
import { fail, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async () => {
	const adminClient = createAdminClient();

	// Get next order index
	const { data: modules } = await adminClient
		.from('modules')
		.select('order_index')
		.order('order_index', { ascending: false })
		.limit(1);

	const nextOrderIndex = (modules?.[0]?.order_index || 0) + 1;

	return {
		nextOrderIndex
	};
};

export const actions: Actions = {
	default: async ({ request }) => {
		const formData = await request.formData();
		
		const title = formData.get('title')?.toString().trim() || '';
		const slug = formData.get('slug')?.toString().trim() || '';
		const description = formData.get('description')?.toString().trim() || '';
		const thumbnail_url = formData.get('thumbnail_url')?.toString().trim() || null;
		const order_index = parseInt(formData.get('order_index')?.toString() || '1', 10);
		const is_published = formData.get('is_published') === 'on';
		const is_bonus = formData.get('is_bonus') === 'on';

		const errors: Record<string, string> = {};

		if (!title) errors.title = 'Title is required';
		if (!slug) errors.slug = 'Slug is required';
		if (!/^[a-z0-9-]+$/.test(slug)) errors.slug = 'Slug must be lowercase letters, numbers, and hyphens only';

		if (Object.keys(errors).length > 0) {
			return fail(400, { errors });
		}

		const adminClient = createAdminClient();

		// Check for duplicate slug
		const { data: existing } = await adminClient
			.from('modules')
			.select('id')
			.eq('slug', slug)
			.single();

		if (existing) {
			return fail(400, { errors: { slug: 'This slug is already in use' } as Record<string, string> });
		}

		// Create module
		const { data: module, error } = await adminClient
			.from('modules')
			.insert({
				title,
				slug,
				description: description || null,
				thumbnail_url,
				order_index,
				is_published,
				is_bonus
			})
			.select()
			.single();

		if (error) {
			console.error('Failed to create module:', error);
			return fail(500, { error: 'Failed to create module' });
		}

		throw redirect(303, `/admin/modules/${module.id}`);
	}
};
