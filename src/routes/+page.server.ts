import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { site_settings, modules, lessons, testimonials, pricing_config } from '$lib/server/db/schema';
import { eq, and, asc } from 'drizzle-orm';

export const load: PageServerLoad = async () => {
	// Check maintenance mode
	let maintenance = false;
	try {
		const settingRows = await db
			.select({ value: site_settings.value })
			.from(site_settings)
			.where(eq(site_settings.key, 'maintenance_mode'))
			.limit(1);

		maintenance = settingRows[0]?.value === 'true';
	} catch (err) {
		console.error('Failed to check maintenance mode:', err);
	}

	if (maintenance) {
		return { maintenance };
	}

	try {
		// Get published modules for preview with lessons
		const moduleRows = await db.query.modules.findMany({
			columns: {
				id: true,
				title: true,
				slug: true,
				description: true,
				thumbnail_url: true,
				order_index: true,
				is_published: true,
				is_bonus: true
			},
			with: {
				lessons: {
					columns: {
						id: true,
						lesson_type: true,
						duration_minutes: true,
						is_published: true
					},
					where: eq(lessons.is_published, true)
				}
			},
			where: eq(modules.is_published, true),
			orderBy: asc(modules.order_index)
		});

		// Get featured testimonials
		const testimonialRows = await db
			.select()
			.from(testimonials)
			.where(and(eq(testimonials.is_published, true), eq(testimonials.is_featured, true)))
			.orderBy(asc(testimonials.order_index))
			.limit(6);

		// Get active pricing
		const pricingRows = await db
			.select()
			.from(pricing_config)
			.where(eq(pricing_config.is_active, true))
			.limit(1);

		return {
			modules: moduleRows,
			testimonials: testimonialRows,
			pricing: pricingRows[0] ?? null,
			maintenance: false
		};
	} catch (err) {
		console.error('Failed to load homepage data:', err);
		return {
			modules: [],
			testimonials: [],
			pricing: null,
			maintenance: false
		};
	}
};
