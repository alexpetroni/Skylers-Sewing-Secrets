import type { PageServerLoad, Actions } from './$types';
import { redirect, fail } from '@sveltejs/kit';
import { createAdminClient } from '$lib/server/supabase';

export const load: PageServerLoad = async ({ locals }) => {
	const profile = locals.profile;

	if (!profile) {
		throw redirect(303, '/auth/sign-in?redirect=/leave-review');
	}

	if (!profile.is_member) {
		throw redirect(303, '/checkout?redirect=/leave-review');
	}

	// Get user's existing testimonial if any
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
	submit: async ({ request, locals }) => {
		const profile = locals.profile;

		if (!profile) {
			throw redirect(303, '/auth/sign-in');
		}

		if (!profile.is_member) {
			return fail(403, { error: 'Only members can leave reviews.' });
		}

		if (profile.is_suspended) {
			return fail(403, { error: 'Your account is suspended.' });
		}

		const formData = await request.formData();
		const content = formData.get('content') as string;
		const rating = parseInt(formData.get('rating') as string, 10);
		const authorTitle = formData.get('author_title') as string;

		// Validation
		if (!content || content.trim().length < 20) {
			return fail(400, {
				error: 'Review must be at least 20 characters long.',
				content,
				rating,
				authorTitle
			});
		}

		if (content.trim().length > 1000) {
			return fail(400, {
				error: 'Review must be less than 1000 characters.',
				content,
				rating,
				authorTitle
			});
		}

		if (!rating || rating < 1 || rating > 5) {
			return fail(400, {
				error: 'Please select a rating between 1 and 5 stars.',
				content,
				rating,
				authorTitle
			});
		}

		// Check for existing testimonial
		const { data: existingTestimonial } = await locals.supabase
			.from('testimonials')
			.select('id, is_published')
			.eq('user_id', profile.id)
			.maybeSingle();

		if (existingTestimonial) {
			// Can only update if not published
			if (existingTestimonial.is_published) {
				return fail(400, {
					error: 'Your review has already been published and cannot be edited.',
					content,
					rating,
					authorTitle
				});
			}

			// Update existing - use admin client to bypass RLS
			const adminClient = createAdminClient();
			const { error } = await adminClient
				.from('testimonials')
				.update({
					content: content.trim(),
					rating,
					author_name: profile.full_name || 'Member',
					author_title: authorTitle?.trim() || null,
					author_avatar_url: profile.avatar_url
				})
				.eq('id', existingTestimonial.id);

			if (error) {
				console.error('Error updating testimonial:', error);
				return fail(500, {
					error: 'Failed to update review. Please try again.',
					content,
					rating,
					authorTitle
				});
			}
		} else {
			// Create new - use admin client to bypass RLS
			const adminClient = createAdminClient();
			const { error } = await adminClient
				.from('testimonials')
				.insert({
					user_id: profile.id,
					content: content.trim(),
					rating,
					author_name: profile.full_name || 'Member',
					author_title: authorTitle?.trim() || null,
					author_avatar_url: profile.avatar_url,
					is_published: false,
					is_featured: false
				});

			if (error) {
				console.error('Error creating testimonial:', error);
				return fail(500, {
					error: 'Failed to submit review. Please try again.',
					content,
					rating,
					authorTitle
				});
			}
		}

		throw redirect(303, '/profile?review=submitted');
	}
};
