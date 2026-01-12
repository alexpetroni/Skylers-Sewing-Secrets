import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, locals }) => {
	const profile = locals.profile;

	// Get module with lessons
	const { data: module } = await locals.supabase
		.from('modules')
		.select(`
			id,
			title,
			slug,
			description,
			thumbnail_url,
			order_index,
			is_bonus,
			lessons (
				id,
				title,
				slug,
				description,
				duration_minutes,
				is_free_preview,
				is_published,
				order_index
			)
		`)
		.eq('slug', params.moduleSlug)
		.eq('is_published', true)
		.single();

	if (!module) {
		throw error(404, 'Module not found');
	}

	// Get user progress if member
	let progressMap: Record<string, boolean> = {};

	if (profile?.is_member) {
		const lessonIds = module.lessons?.map(l => l.id) || [];

		if (lessonIds.length > 0) {
			const { data: progress } = await locals.supabase
				.from('user_progress')
				.select('lesson_id, completed')
				.eq('user_id', profile.id)
				.in('lesson_id', lessonIds)
				.eq('completed', true);

			if (progress) {
				progressMap = Object.fromEntries(
					progress.map(p => [p.lesson_id, p.completed])
				);
			}
		}
	}

	// Filter and sort lessons, attach progress
	const lessonsWithProgress = (module.lessons || [])
		.filter(l => l.is_published)
		.sort((a, b) => a.order_index - b.order_index)
		.map(lesson => ({
			...lesson,
			progress: progressMap[lesson.id] ? { completed: true } : null
		}));

	return {
		module: {
			...module,
			lessons: lessonsWithProgress
		},
		profile
	};
};
