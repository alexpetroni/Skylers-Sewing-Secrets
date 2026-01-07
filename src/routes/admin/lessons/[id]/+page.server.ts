import type { PageServerLoad, Actions } from './$types';
import { createAdminClient } from '$lib/server/supabase';
import { error, fail, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
	const adminClient = createAdminClient();

	const [{ data: lesson }, { data: modules }] = await Promise.all([
		adminClient
			.from('lessons')
			.select('*')
			.eq('id', params.id)
			.single(),
		adminClient
			.from('modules')
			.select('id, title')
			.order('order_index')
	]);

	if (!lesson) {
		throw error(404, 'Lesson not found');
	}

	return {
		lesson,
		modules: modules || []
	};
};

export const actions: Actions = {
	update: async ({ params, request }) => {
		const formData = await request.formData();
		
		const module_id = formData.get('module_id')?.toString() || '';
		const title = formData.get('title')?.toString().trim() || '';
		const slug = formData.get('slug')?.toString().trim() || '';
		const description = formData.get('description')?.toString().trim() || '';
		const video_url = formData.get('video_url')?.toString().trim() || null;
		const thumbnail_url = formData.get('thumbnail_url')?.toString().trim() || null;
		const duration_minutes = formData.get('duration_minutes')?.toString() 
			? parseInt(formData.get('duration_minutes')!.toString(), 10) 
			: null;
		const order_index = parseInt(formData.get('order_index')?.toString() || '1', 10);
		const content = formData.get('content')?.toString().trim() || null;
		const is_published = formData.get('is_published') === 'on';
		const is_free_preview = formData.get('is_free_preview') === 'on';

		const errors: Record<string, string> = {};

		if (!module_id) errors.module_id = 'Module is required';
		if (!title) errors.title = 'Title is required';
		if (!slug) errors.slug = 'Slug is required';
		if (!/^[a-z0-9-]+$/.test(slug)) errors.slug = 'Slug must be lowercase letters, numbers, and hyphens only';

		if (Object.keys(errors).length > 0) {
			return fail(400, { errors });
		}

		const adminClient = createAdminClient();

		// Check for duplicate slug within the same module (excluding current lesson)
		const { data: existing } = await adminClient
			.from('lessons')
			.select('id')
			.eq('module_id', module_id)
			.eq('slug', slug)
			.neq('id', params.id)
			.single();

		if (existing) {
			return fail(400, { errors: { slug: 'This slug is already in use in this module' } });
		}

		// Update lesson
		const { error: updateError } = await adminClient
			.from('lessons')
			.update({
				module_id,
				title,
				slug,
				description: description || null,
				video_url,
				thumbnail_url,
				duration_minutes,
				order_index,
				content,
				is_published,
				is_free_preview,
				updated_at: new Date().toISOString()
			})
			.eq('id', params.id);

		if (updateError) {
			console.error('Failed to update lesson:', updateError);
			return fail(500, { error: 'Failed to update lesson' });
		}

		return { success: true };
	},

	delete: async ({ params }) => {
		const adminClient = createAdminClient();

		// Delete lesson resources first
		await adminClient
			.from('lesson_resources')
			.delete()
			.eq('lesson_id', params.id);

		// Delete user progress for this lesson
		await adminClient
			.from('user_progress')
			.delete()
			.eq('lesson_id', params.id);

		// Delete the lesson
		const { error: deleteError } = await adminClient
			.from('lessons')
			.delete()
			.eq('id', params.id);

		if (deleteError) {
			console.error('Failed to delete lesson:', deleteError);
			return fail(500, { error: 'Failed to delete lesson' });
		}

		throw redirect(303, '/admin/lessons');
	}
};
