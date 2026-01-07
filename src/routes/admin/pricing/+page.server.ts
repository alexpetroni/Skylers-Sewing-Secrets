import type { PageServerLoad, Actions } from './$types';
import { createAdminClient } from '$lib/server/supabase';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async () => {
	const adminClient = createAdminClient();

	const [{ data: pricing }, { data: promoCodes }, { data: payments }] = await Promise.all([
		adminClient.from('pricing_config').select('*').eq('is_active', true).single(),
		adminClient.from('promo_codes').select('*').order('created_at', { ascending: false }),
		adminClient.from('payments').select('*').order('created_at', { ascending: false }).limit(20)
	]);

	// Get user emails for payments
	const userIds = payments?.map(p => p.user_id).filter(Boolean) || [];
	let users: Record<string, { email: string }> = {};
	
	if (userIds.length > 0) {
		const { data: userData } = await adminClient
			.from('profiles')
			.select('id, email')
			.in('id', userIds);
		
		users = Object.fromEntries((userData || []).map(u => [u.id, { email: u.email }]));
	}

	const paymentsWithUsers = (payments || []).map(p => ({
		...p,
		user: p.user_id ? users[p.user_id] : null
	}));

	return {
		pricing,
		promoCodes: promoCodes || [],
		payments: paymentsWithUsers
	};
};

export const actions: Actions = {
	updatePrice: async ({ request }) => {
		const formData = await request.formData();
		const base_price = parseInt(formData.get('base_price')?.toString() || '149', 10);
		const is_active = formData.get('is_active') === 'on';

		const adminClient = createAdminClient();

		// Check if pricing config exists
		const { data: existing } = await adminClient
			.from('pricing_config')
			.select('id')
			.single();

		if (existing) {
			const { error } = await adminClient
				.from('pricing_config')
				.update({ base_price, is_active, updated_at: new Date().toISOString() })
				.eq('id', existing.id);

			if (error) {
				return fail(500, { error: 'Failed to update pricing' });
			}
		} else {
			const { error } = await adminClient
				.from('pricing_config')
				.insert({ base_price, currency: 'GBP', is_active });

			if (error) {
				return fail(500, { error: 'Failed to create pricing' });
			}
		}

		return { success: true, message: 'Pricing updated successfully' };
	},

	createPromo: async ({ request }) => {
		const formData = await request.formData();
		const code = formData.get('code')?.toString().toUpperCase().trim() || '';
		const discount_type = formData.get('discount_type')?.toString() as 'percentage' | 'fixed';
		const discount_value = parseFloat(formData.get('discount_value')?.toString() || '0');
		const max_uses = formData.get('max_uses')?.toString() 
			? parseInt(formData.get('max_uses')!.toString(), 10) 
			: null;
		const valid_until = formData.get('valid_until')?.toString() || null;
		const description = formData.get('description')?.toString().trim() || null;

		if (!code) {
			return fail(400, { error: 'Code is required' });
		}

		if (!discount_value || discount_value <= 0) {
			return fail(400, { error: 'Valid discount value is required' });
		}

		const adminClient = createAdminClient();

		// Check for duplicate code
		const { data: existing } = await adminClient
			.from('promo_codes')
			.select('id')
			.eq('code', code)
			.single();

		if (existing) {
			return fail(400, { error: 'This code already exists' });
		}

		const { error } = await adminClient
			.from('promo_codes')
			.insert({
				code,
				discount_type,
				discount_value,
				max_uses,
				valid_from: new Date().toISOString(),
				valid_until,
				description,
				is_active: true
			});

		if (error) {
			console.error('Failed to create promo code:', error);
			return fail(500, { error: 'Failed to create promo code' });
		}

		return { success: true, message: 'Promo code created successfully' };
	},

	togglePromo: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id')?.toString();
		const is_active = formData.get('is_active')?.toString() === 'true';

		if (!id) {
			return fail(400, { error: 'Promo code ID is required' });
		}

		const adminClient = createAdminClient();

		const { error } = await adminClient
			.from('promo_codes')
			.update({ is_active })
			.eq('id', id);

		if (error) {
			return fail(500, { error: 'Failed to update promo code' });
		}

		return { success: true };
	}
};
