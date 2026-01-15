import type { PageServerLoad } from './$types';
import { createAdminClient } from '$lib/server/supabase';

export const load: PageServerLoad = async () => {
	const adminClient = createAdminClient();

	const { data: modules } = await adminClient
		.from('modules')
		.select(`
			*,
			lessons:lessons(count)
		`)
		.order('order_index');

	// Transform to get lesson count
	const modulesWithCount = (modules || []).map(m => ({
		...m,
		lessons_count: m.lessons?.[0]?.count || 0
	}));

	return {
		modules: modulesWithCount
	};
};
