import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
	const user = locals.user;

	// Must be authenticated and a member
	if (!user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	if (!user.is_member) {
		return json({ error: 'Membership required' }, { status: 403 });
	}

	try {
		const { lessonId, completed = true, position } = await request.json();

		if (!lessonId) {
			return json({ error: 'Lesson ID is required' }, { status: 400 });
		}

		// Upsert progress
		const updateData: Record<string, unknown> = {
			user_id: user.id,
			lesson_id: lessonId,
			completed,
			updated_at: new Date().toISOString()
		};

		if (completed) {
			updateData.completed_at = new Date().toISOString();
		}

		if (typeof position === 'number') {
			updateData.last_position_seconds = position;
		}

		const { data, error } = await locals.supabase
			.from('user_progress')
			.upsert(updateData, {
				onConflict: 'user_id,lesson_id'
			})
			.select()
			.single();

		if (error) {
			console.error('Failed to update progress:', error);
			return json({ error: 'Failed to update progress' }, { status: 500 });
		}

		return json({ success: true, progress: data });
	} catch (err) {
		console.error('Progress API error:', err);
		return json({ error: 'Invalid request' }, { status: 400 });
	}
};

export const GET: RequestHandler = async ({ url, locals }) => {
	const user = locals.user;

	if (!user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const lessonId = url.searchParams.get('lessonId');
	const moduleId = url.searchParams.get('moduleId');

	try {
		let query = locals.supabase
			.from('user_progress')
			.select('*')
			.eq('user_id', user.id);

		if (lessonId) {
			query = query.eq('lesson_id', lessonId);
		}

		if (moduleId) {
			// Get all lessons for this module first
			const { data: lessons } = await locals.supabase
				.from('lessons')
				.select('id')
				.eq('module_id', moduleId);

			if (lessons && lessons.length > 0) {
				const lessonIds = lessons.map(l => l.id);
				query = query.in('lesson_id', lessonIds);
			}
		}

		const { data, error } = await query;

		if (error) {
			console.error('Failed to fetch progress:', error);
			return json({ error: 'Failed to fetch progress' }, { status: 500 });
		}

		return json({ progress: data || [] });
	} catch (err) {
		console.error('Progress API error:', err);
		return json({ error: 'Invalid request' }, { status: 400 });
	}
};
