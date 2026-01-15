import type { PageServerLoad, Actions } from './$types';
import { redirect, fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
	const profile = locals.profile;

	if (!profile) {
		throw redirect(303, '/auth/sign-in?redirect=/profile');
	}

	// Get user's testimonial if any
	const { data: testimonial } = await locals.supabase
		.from('testimonials')
		.select('*')
		.eq('user_id', profile.id)
		.maybeSingle();

	return {
		profile,
		testimonial
	};
};

export const actions: Actions = {
	updateProfile: async ({ request, locals }) => {
		const profile = locals.profile;

		if (!profile) {
			throw redirect(303, '/auth/sign-in');
		}

		const formData = await request.formData();
		const fullName = formData.get('full_name') as string;

		if (!fullName || fullName.trim().length < 2) {
			return fail(400, {
				error: 'Name must be at least 2 characters',
				fullName
			});
		}

		const { error } = await locals.supabase
			.from('profiles')
			.update({ full_name: fullName.trim() })
			.eq('id', profile.id);

		if (error) {
			console.error('Error updating profile:', error);
			return fail(500, {
				error: 'Failed to update profile. Please try again.',
				fullName
			});
		}

		return { success: true };
	}
};
