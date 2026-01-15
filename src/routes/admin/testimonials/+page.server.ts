import type { PageServerLoad } from './$types';
import { createAdminClient } from '$lib/server/supabase';

export const load: PageServerLoad = async () => {
	const adminClient = createAdminClient();

	const { data: testimonials } = await adminClient
		.from('testimonials')
		.select('*')
		.order('order_index');

	return {
		testimonials: testimonials || []
	};
};
