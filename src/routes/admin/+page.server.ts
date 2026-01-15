import type { PageServerLoad } from './$types';
import { createAdminClient } from '$lib/server/supabase';

export const load: PageServerLoad = async ({ locals }) => {
	const adminClient = createAdminClient();

	// Get stats
	const [
		{ count: totalMembers },
		{ data: payments },
		{ count: totalModules },
		{ count: totalLessons }
	] = await Promise.all([
		adminClient.from('profiles').select('*', { count: 'exact', head: true }).eq('is_member', true),
		adminClient.from('payments').select('amount').eq('status', 'succeeded'),
		adminClient.from('modules').select('*', { count: 'exact', head: true }).eq('is_published', true),
		adminClient.from('lessons').select('*', { count: 'exact', head: true }).eq('is_published', true)
	]);

	const totalRevenue = (payments || []).reduce((sum, p) => sum + (p.amount || 0), 0) / 100;

	// Get recent members
	const { data: recentMembers } = await adminClient
		.from('profiles')
		.select('id, email, full_name, member_since, created_at')
		.eq('is_member', true)
		.order('member_since', { ascending: false })
		.limit(5);

	// Get recent payments
	const { data: recentPayments } = await adminClient
		.from('payments')
		.select('id, amount, currency, status, created_at, user_id')
		.eq('status', 'succeeded')
		.order('created_at', { ascending: false })
		.limit(5);

	// Get user emails for payments
	const paymentUserIds = recentPayments?.map(p => p.user_id).filter(Boolean) || [];
	let paymentUsers: Record<string, { email: string }> = {};
	
	if (paymentUserIds.length > 0) {
		const { data: users } = await adminClient
			.from('profiles')
			.select('id, email')
			.in('id', paymentUserIds);
		
		paymentUsers = Object.fromEntries((users || []).map(u => [u.id, { email: u.email }]));
	}

	const paymentsWithUsers = (recentPayments || []).map(p => ({
		...p,
		user: p.user_id ? paymentUsers[p.user_id] : null
	}));

	// Get recent contact submissions
	const { data: recentContacts } = await adminClient
		.from('contact_submissions')
		.select('id, name, email, subject, message, is_read, created_at')
		.order('created_at', { ascending: false })
		.limit(5);

	return {
		stats: {
			totalMembers: totalMembers || 0,
			totalRevenue,
			totalModules: totalModules || 0,
			totalLessons: totalLessons || 0
		},
		recentMembers: recentMembers || [],
		recentPayments: paymentsWithUsers,
		recentContacts: recentContacts || []
	};
};
