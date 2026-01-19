/**
 * Modules Seeder
 */

import { supabase } from '../lib/client.js';
import { loadJson, logSuccess, logError } from '../lib/utils.js';

interface Module {
  title: string;
  slug: string;
  description: string;
  order_index: number;
  is_published: boolean;
  is_bonus: boolean;
}

export async function seedModules(): Promise<Map<string, string>> {
  console.log('Seeding modules...');
  const modules = loadJson<Module[]>('modules.json');
  const slugToId = new Map<string, string>();

  for (const module of modules) {
    const { data, error } = await supabase
      .from('modules')
      .upsert(module, { onConflict: 'slug' })
      .select('id, slug')
      .single();

    if (error) {
      logError(`Error seeding module "${module.title}": ${error.message}`);
    } else {
      slugToId.set(data.slug, data.id);
      logSuccess(module.title);
    }
  }

  return slugToId;
}

// Allow running directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedModules()
    .then(() => {
      console.log('\n✅ Modules seeded!');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Error:', err);
      process.exit(1);
    });
}
