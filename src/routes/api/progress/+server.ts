import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { user_progress, lessons } from '$lib/server/db/schema';
import { eq, and, inArray, type SQL } from 'drizzle-orm';
import { isActiveMember } from '$lib/server/access';

export const POST: RequestHandler = async ({ request, locals }) => {
	const profile = locals.profile;

	// Must be authenticated and an active member
	if (!profile) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	if (!profile.is_member) {
		return json({ error: 'Membership required' }, { status: 403 });
	}

	// A member who is not active is suspended
	if (!isActiveMember(profile)) {
		return json({ error: 'Account suspended' }, { status: 403 });
	}

	try {
		const { lessonId, completed = true, position } = await request.json();

		if (!lessonId) {
			return json({ error: 'Lesson ID is required' }, { status: 400 });
		}

		// Upsert progress
		const now = new Date().toISOString();
		const updateData: Partial<typeof user_progress.$inferInsert> = {
			completed,
			updated_at: now
		};

		if (completed) {
			updateData.completed_at = now;
		}

		if (typeof position === 'number') {
			updateData.last_position_seconds = position;
		}

		try {
			const rows = await db
				.insert(user_progress)
				.values({
					user_id: profile.id,
					lesson_id: lessonId,
					...updateData
				})
				.onConflictDoUpdate({
					target: [user_progress.user_id, user_progress.lesson_id],
					set: updateData
				})
				.returning();

			return json({ success: true, progress: rows[0] });
		} catch (err) {
			console.error('Failed to update progress:', err);
			return json({ error: 'Failed to update progress' }, { status: 500 });
		}
	} catch (err) {
		console.error('Progress API error:', err);
		return json({ error: 'Invalid request' }, { status: 400 });
	}
};

export const GET: RequestHandler = async ({ url, locals }) => {
	const profile = locals.profile;

	// Same checks as POST: 401 signed out, 403 non-member, 403 suspended
	if (!profile) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	if (!profile.is_member) {
		return json({ error: 'Membership required' }, { status: 403 });
	}

	if (!isActiveMember(profile)) {
		return json({ error: 'Account suspended' }, { status: 403 });
	}

	const lessonId = url.searchParams.get('lessonId');
	const moduleId = url.searchParams.get('moduleId');

	try {
		const conditions: SQL[] = [eq(user_progress.user_id, profile.id)];

		if (lessonId) {
			conditions.push(eq(user_progress.lesson_id, lessonId));
		}

		if (moduleId) {
			// Get all (published) lessons for this module first
			const moduleLessons = await db
				.select({ id: lessons.id })
				.from(lessons)
				.where(and(eq(lessons.module_id, moduleId), eq(lessons.is_published, true)));

			if (moduleLessons.length === 0) {
				// No published lessons: no progress for this module (previously
				// the filter was silently dropped, returning ALL progress)
				return json({ progress: [] });
			}

			const lessonIds = moduleLessons.map((l) => l.id);
			conditions.push(inArray(user_progress.lesson_id, lessonIds));
		}

		const data = await db
			.select()
			.from(user_progress)
			.where(and(...conditions));

		return json({ progress: data });
	} catch (err) {
		console.error('Failed to fetch progress:', err);
		return json({ error: 'Failed to fetch progress' }, { status: 500 });
	}
};
