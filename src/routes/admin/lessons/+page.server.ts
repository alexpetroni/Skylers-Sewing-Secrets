import type { PageServerLoad } from './$types';
import { createAdminClient } from '$lib/server/supabase';

export const load: PageServerLoad = async () => {
	const adminClient = createAdminClient();

	const [{ data: lessons }, { data: modules }] = await Promise.all([
		adminClient
			.from('lessons')
			.select(`
				*,
				module:modules (
					id,
					title
				)
			`)
			.order('module_id')
			.order('order_index'),
		adminClient
			.from('modules')
			.select('id, title')
			.order('order_index')
	]);

	return {
		lessons: lessons || [],
		modules: modules || []
	};
};
