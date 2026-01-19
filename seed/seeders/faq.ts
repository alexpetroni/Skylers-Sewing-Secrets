/**
 * FAQ Seeder
 */

import { supabase } from '../lib/client.js';
import { loadJson, logSuccess, logError } from '../lib/utils.js';

interface FaqItem {
  question: string;
  answer: string;
  category?: string;
  order_index: number;
  is_published: boolean;
}

export async function seedFaq(): Promise<void> {
  console.log('Seeding FAQ items...');
  const faqItems = loadJson<FaqItem[]>('faq.json');

  // Delete existing FAQ items to avoid duplicates
  await supabase.from('faq_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  for (const item of faqItems) {
    const { error } = await supabase
      .from('faq_items')
      .insert(item);

    if (error) {
      logError(`Error seeding FAQ "${item.question.substring(0, 30)}...": ${error.message}`);
    } else {
      logSuccess(`${item.question.substring(0, 50)}...`);
    }
  }
}

// Allow running directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedFaq()
    .then(() => {
      console.log('\n✅ FAQ seeded!');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Error:', err);
      process.exit(1);
    });
}
