/**
 * Lessons Seeder
 */

import { supabase } from '../lib/client.js';
import { loadJson, logSuccess, logError } from '../lib/utils.js';
import { seedModules } from './modules.js';

interface Lesson {
  module_slug: string;
  title: string;
  slug: string;
  description: string;
  lesson_type: 'video' | 'article';
  order_index: number;
  duration_minutes?: number;
  is_free_preview: boolean;
  is_published: boolean;
}

export async function seedLessons(moduleSlugToId?: Map<string, string>): Promise<void> {
  // If no module map provided, fetch or create modules first
  if (!moduleSlugToId) {
    console.log('Fetching module IDs...');
    const { data: modules } = await supabase
      .from('modules')
      .select('id, slug');

    if (!modules || modules.length === 0) {
      console.log('No modules found. Seeding modules first...');
      moduleSlugToId = await seedModules();
    } else {
      moduleSlugToId = new Map(modules.map(m => [m.slug, m.id]));
    }
  }

  console.log('\nSeeding lessons...');
  const lessons = loadJson<Lesson[]>('lessons.json');

  for (const lesson of lessons) {
    const moduleId = moduleSlugToId.get(lesson.module_slug);
    if (!moduleId) {
      logError(`Module not found for lesson "${lesson.title}" (module_slug: ${lesson.module_slug})`);
      continue;
    }

    const { module_slug, ...lessonData } = lesson;
    const { error } = await supabase
      .from('lessons')
      .upsert(
        { ...lessonData, module_id: moduleId },
        { onConflict: 'module_id,slug' }
      );

    if (error) {
      logError(`Error seeding lesson "${lesson.title}": ${error.message}`);
    } else {
      logSuccess(lesson.title);
    }
  }
}

// Allow running directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedLessons()
    .then(() => {
      console.log('\n✅ Lessons seeded!');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Error:', err);
      process.exit(1);
    });
}
