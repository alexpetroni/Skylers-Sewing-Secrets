import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { createAdminClient } from '$lib/server/supabase';

export const load: PageServerLoad = async () => {
	const adminClient = createAdminClient();

	const { data: maintenanceSetting } = await adminClient
		.from('site_settings')
		.select('value, updated_at')
		.eq('key', 'maintenance_mode')
		.single();

	return {
		maintenanceMode: maintenanceSetting?.value === 'true',
		maintenanceUpdatedAt: maintenanceSetting?.updated_at || null
	};
};

export const actions: Actions = {
	toggleMaintenance: async () => {
		const adminClient = createAdminClient();

		const { data: current } = await adminClient
			.from('site_settings')
			.select('value')
			.eq('key', 'maintenance_mode')
			.single();

		const newValue = current?.value === 'true' ? 'false' : 'true';

		const { error } = await adminClient
			.from('site_settings')
			.update({ value: newValue, updated_at: new Date().toISOString() })
			.eq('key', 'maintenance_mode');

		if (error) {
			return fail(500, { error: 'Failed to update maintenance mode' });
		}

		return { success: true };
	}
};
