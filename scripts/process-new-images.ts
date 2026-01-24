/**
 * Process new carousel images
 * - Auto-orient based on EXIF data
 * - Resize for web (1600px width for hero carousel)
 * - Convert to JPEG with good quality
 *
 * Usage: npx tsx scripts/process-new-images.ts
 */

import sharp from 'sharp';
import { readdir, mkdir } from 'fs/promises';
import { join, basename, extname } from 'path';

const INPUT_DIR = 'assets/new-images';
const OUTPUT_DIR = 'static/images/collage';

// Hero carousel needs larger images
const MAX_WIDTH = 1600;
const QUALITY = 85;

async function processImages() {
  console.log('Processing new carousel images...\n');

  // Ensure output directory exists
  await mkdir(OUTPUT_DIR, { recursive: true });

  // Get all image files
  const files = await readdir(INPUT_DIR);
  const imageFiles = files.filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f));

  console.log(`Found ${imageFiles.length} images to process\n`);

  for (const file of imageFiles) {
    const inputPath = join(INPUT_DIR, file);

    // Normalize filename (replace spaces with hyphens, lowercase)
    const ext = extname(file);
    const name = basename(file, ext)
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');

    const outputPath = join(OUTPUT_DIR, `${name}.jpg`);

    try {
      const info = await sharp(inputPath)
        // First auto-orient based on EXIF, then rotate 90° CCW for landscape
        .rotate()
        .rotate(-90)
        .resize(MAX_WIDTH, undefined, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ quality: QUALITY, progressive: true })
        .toFile(outputPath);

      console.log(`✓ ${file} -> ${name}.jpg (${info.width}x${info.height}, ${Math.round(info.size / 1024)}KB)`);
    } catch (err) {
      console.error(`✗ ${file}: ${err instanceof Error ? err.message : err}`);
    }
  }

  console.log('\nDone processing images!');
  console.log(`\nOutput directory: ${OUTPUT_DIR}`);
}

processImages().catch(console.error);
