import type { PageServerLoad, Actions } from './$types';
import { createAdminClient } from '$lib/server/supabase';
import { error, fail, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
	const adminClient = createAdminClient();

	const { data: module } = await adminClient
		.from('modules')
		.select(`
			*,
			lessons (
				id,
				title,
				slug,
				order_index,
				is_published,
				is_free_preview
			)
		`)
		.eq('id', params.id)
		.single();

	if (!module) {
		throw error(404, 'Module not found');
	}

	// Sort lessons by order
	if (module.lessons) {
		module.lessons.sort((a: { order_index: number }, b: { order_index: number }) => a.order_index - b.order_index);
	}

	return {
		module
	};
};

export const actions: Actions = {
	update: async ({ params, request }) => {
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

		// Check for duplicate slug (excluding current module)
		const { data: existing } = await adminClient
			.from('modules')
			.select('id')
			.eq('slug', slug)
			.neq('id', params.id)
			.single();

		if (existing) {
			return fail(400, { errors: { slug: 'This slug is already in use' } as Record<string, string> });
		}

		// Update module
		const { error: updateError } = await adminClient
			.from('modules')
			.update({
				title,
				slug,
				description: description || null,
				thumbnail_url,
				order_index,
				is_published,
				is_bonus,
				updated_at: new Date().toISOString()
			})
			.eq('id', params.id);

		if (updateError) {
			console.error('Failed to update module:', updateError);
			return fail(500, { error: 'Failed to update module' });
		}

		return { success: true };
	},

	delete: async ({ params }) => {
		const adminClient = createAdminClient();

		// Delete all lessons in this module first
		await adminClient
			.from('lessons')
			.delete()
			.eq('module_id', params.id);

		// Delete the module
		const { error: deleteError } = await adminClient
			.from('modules')
			.delete()
			.eq('id', params.id);

		if (deleteError) {
			console.error('Failed to delete module:', deleteError);
			return fail(500, { error: 'Failed to delete module' });
		}

		throw redirect(303, '/admin/modules');
	}
};
