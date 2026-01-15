import type { PageServerLoad } from './$types';
import { createAdminClient } from '$lib/server/supabase';

export const load: PageServerLoad = async () => {
	const adminClient = createAdminClient();

	const { data: posts } = await adminClient
		.from('blog_posts')
		.select('*')
		.order('created_at', { ascending: false });

	return {
		posts: posts || []
	};
};
