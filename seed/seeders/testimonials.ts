/**
 * Testimonials Seeder
 */

import { supabase } from '../lib/client.js';
import { loadJson, logSuccess, logError } from '../lib/utils.js';

interface Testimonial {
  author_name: string;
  author_title?: string;
  country?: string;
  content: string;
  rating: number;
  is_featured: boolean;
  order_index: number;
  is_published: boolean;
}

export async function seedTestimonials(): Promise<void> {
  console.log('Seeding testimonials...');
  const testimonials = loadJson<Testimonial[]>('testimonials.json');

  // Delete existing testimonials to avoid duplicates
  await supabase.from('testimonials').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  for (const testimonial of testimonials) {
    const { error } = await supabase
      .from('testimonials')
      .insert(testimonial);

    if (error) {
      logError(`Error seeding testimonial from "${testimonial.author_name}": ${error.message}`);
    } else {
      const countryInfo = testimonial.country ? ` (${testimonial.country})` : '';
      logSuccess(`${testimonial.author_name}${countryInfo}`);
    }
  }
}

// Allow running directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedTestimonials()
    .then(() => {
      console.log('\n✅ Testimonials seeded!');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Error:', err);
      process.exit(1);
    });
}
