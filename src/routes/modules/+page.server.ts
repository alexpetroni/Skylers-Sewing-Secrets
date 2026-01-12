import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const profile = locals.profile;

	// Get all published modules with their lessons
	const { data: modules } = await locals.supabase
		.from('modules')
		.select(`
			id,
			title,
			slug,
			description,
			thumbnail_url,
			order_index,
			is_published,
			is_bonus,
			lessons (
				id,
				title,
				slug,
				duration_minutes,
				is_free_preview,
				is_published,
				order_index
			)
		`)
		.eq('is_published', true)
		.order('order_index');

	// If user is a member, get their progress
	let progressMap: Record<string, boolean> = {};

	if (profile?.is_member) {
		const { data: progress } = await locals.supabase
			.from('user_progress')
			.select('lesson_id, completed')
			.eq('user_id', profile.id)
			.eq('completed', true);

		if (progress) {
			progressMap = Object.fromEntries(
				progress.map(p => [p.lesson_id, p.completed])
			);
		}
	}

	// Attach progress to lessons and sort them
	const modulesWithProgress = (modules || []).map(module => ({
		...module,
		lessons: (module.lessons || [])
			.filter(l => l.is_published)
			.sort((a, b) => a.order_index - b.order_index)
			.map(lesson => ({
				...lesson,
				progress: progressMap[lesson.id] ? { completed: true } : null
			}))
	}));

	return {
		modules: modulesWithProgress,
		profile
	};
};
