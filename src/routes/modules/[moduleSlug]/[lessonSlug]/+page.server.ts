import type { PageServerLoad } from './$types';
import { error, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, locals }) => {
	const user = locals.user;

	// Get the lesson with its module
	const { data: lesson } = await locals.supabase
		.from('lessons')
		.select(`
			id,
			title,
			slug,
			description,
			content,
			video_url,
			duration_minutes,
			is_free_preview,
			is_published,
			order_index,
			module:modules!inner (
				id,
				title,
				slug,
				is_published,
				order_index,
				is_bonus
			),
			resources:lesson_resources (
				id,
				title,
				file_url,
				file_type,
				file_size_bytes
			)
		`)
		.eq('slug', params.lessonSlug)
		.eq('modules.slug', params.moduleSlug)
		.eq('is_published', true)
		.single();

	if (!lesson || !lesson.module) {
		throw error(404, 'Lesson not found');
	}

	// Check access
	const canAccess = user?.is_member || lesson.is_free_preview;
	
	if (!canAccess) {
		// Redirect to checkout if not authorized
		throw redirect(303, `/checkout?redirect=/modules/${params.moduleSlug}/${params.lessonSlug}`);
	}

	// Get all lessons in this module for navigation
	const { data: moduleLessons } = await locals.supabase
		.from('lessons')
		.select('id, title, slug, duration_minutes, is_free_preview, is_published, order_index')
		.eq('module_id', lesson.module.id)
		.eq('is_published', true)
		.order('order_index');

	// Get user progress for all lessons in this module
	let progressMap: Record<string, { completed: boolean; completed_at: string | null }> = {};
	
	if (user?.is_member) {
		const lessonIds = moduleLessons?.map(l => l.id) || [];
		
		if (lessonIds.length > 0) {
			const { data: progress } = await locals.supabase
				.from('user_progress')
				.select('lesson_id, completed, completed_at')
				.eq('user_id', user.id)
				.in('lesson_id', lessonIds);

			if (progress) {
				progressMap = Object.fromEntries(
					progress.map(p => [p.lesson_id, { completed: p.completed, completed_at: p.completed_at }])
				);
			}
		}
	}

	// Attach progress to lessons
	const lessonsWithProgress = (moduleLessons || []).map(l => ({
		...l,
		progress: progressMap[l.id] || null
	}));

	return {
		lesson: {
			...lesson,
			progress: progressMap[lesson.id] || null
		},
		module: {
			...lesson.module,
			lessons: lessonsWithProgress
		},
		user
	};
};
