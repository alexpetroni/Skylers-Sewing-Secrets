import type { PageServerLoad } from './$types';
import { createAdminClient } from '$lib/server/supabase';

export const load: PageServerLoad = async () => {
	const adminClient = createAdminClient();

	const { data: faqs } = await adminClient
		.from('faq_items')
		.select('*')
		.order('category')
		.order('order_index');

	return {
		faqs: faqs || []
	};
};
