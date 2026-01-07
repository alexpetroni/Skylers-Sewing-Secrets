import type { PageServerLoad } from './$types';
import { createAdminClient } from '$lib/server/supabase';

export const load: PageServerLoad = async () => {
	const adminClient = createAdminClient();

	const { data: subscribers } = await adminClient
		.from('newsletter_subscribers')
		.select('*')
		.order('subscribed_at', { ascending: false });

	return {
		subscribers: subscribers || []
	};
};
