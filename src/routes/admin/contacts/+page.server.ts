import type { PageServerLoad, Actions } from './$types';
import { createAdminClient } from '$lib/server/supabase';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async () => {
	const adminClient = createAdminClient();

	const { data: contacts } = await adminClient
		.from('contact_submissions')
		.select('*')
		.order('created_at', { ascending: false });

	return {
		contacts: contacts || []
	};
};

export const actions: Actions = {
	markRead: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id')?.toString();

		if (!id) {
			return fail(400, { error: 'Contact ID is required' });
		}

		const adminClient = createAdminClient();

		const { error } = await adminClient
			.from('contact_submissions')
			.update({ is_read: true })
			.eq('id', id);

		if (error) {
			return fail(500, { error: 'Failed to update contact' });
		}

		return { success: true };
	}
};
