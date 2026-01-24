/**
 * Process carousel assets:
 * - Process images (auto-orient, resize)
 * - Extract video thumbnails using ffmpeg
 * - Prepare for upload to Bunny.net
 *
 * Usage: npx tsx scripts/process-carousel-assets.ts
 */

import sharp from 'sharp';
import { readdir, mkdir } from 'fs/promises';
import { join, basename, extname } from 'path';
import { execSync } from 'child_process';

const INPUT_DIR = 'assets/new-images';
const OUTPUT_DIR = 'static/images/collage';

// Portrait carousel - optimize for display without cropping
const MAX_HEIGHT = 900; // Max height for carousel display
const QUALITY = 85;

function normalizeFilename(filename: string): string {
  const ext = extname(filename);
  return basename(filename, ext)
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[_]/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-');
}

async function processImages() {
  console.log('=== Processing Images ===\n');

  const files = await readdir(INPUT_DIR);
  const imageFiles = files.filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f));

  console.log(`Found ${imageFiles.length} images\n`);

  const processed: string[] = [];

  for (const file of imageFiles) {
    const inputPath = join(INPUT_DIR, file);
    const name = normalizeFilename(file);
    const outputPath = join(OUTPUT_DIR, `${name}.jpg`);

    try {
      // Auto-orient based on EXIF data, resize maintaining aspect ratio
      const info = await sharp(inputPath)
        .rotate() // Auto-orient based on EXIF
        .resize(undefined, MAX_HEIGHT, {
          fit: 'inside', // Maintain aspect ratio, fit within height
          withoutEnlargement: true
        })
        .jpeg({ quality: QUALITY, progressive: true })
        .toFile(outputPath);

      console.log(`✓ ${file} -> ${name}.jpg (${info.width}x${info.height}, ${Math.round(info.size / 1024)}KB)`);
      processed.push(`${name}.jpg`);
    } catch (err) {
      console.error(`✗ ${file}: ${err instanceof Error ? err.message : err}`);
    }
  }

  return processed;
}

async function extractVideoThumbnails() {
  console.log('\n=== Extracting Video Thumbnails ===\n');

  const files = await readdir(INPUT_DIR);
  // Only include portrait videos - exclude Pintuck3.mp4 (landscape)
  const videoFiles = files.filter(f =>
    /\.(mp4|mov|avi|webm)$/i.test(f) && !f.toLowerCase().includes('pintuck3')
  );

  console.log(`Found ${videoFiles.length} portrait videos\n`);

  const videos: Array<{ thumbnail: string; video: string; originalName: string }> = [];

  for (const file of videoFiles) {
    const inputPath = join(INPUT_DIR, file);
    const name = normalizeFilename(file);
    const thumbPath = join(OUTPUT_DIR, `${name}-thumb.jpg`);
    const tempThumbPath = join(OUTPUT_DIR, `${name}-temp.jpg`);

    try {
      // Extract frame at 1 second using ffmpeg
      console.log(`Extracting thumbnail from ${file}...`);
      execSync(`ffmpeg -y -i "${inputPath}" -ss 00:00:01 -vframes 1 -q:v 2 "${tempThumbPath}" 2>/dev/null`);

      // Process thumbnail with sharp (resize, optimize) - keep portrait orientation
      const info = await sharp(tempThumbPath)
        .resize(undefined, MAX_HEIGHT, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ quality: QUALITY, progressive: true })
        .toFile(thumbPath);

      // Clean up temp file
      execSync(`rm "${tempThumbPath}"`);

      console.log(`✓ ${file} -> ${name}-thumb.jpg (${info.width}x${info.height}, ${Math.round(info.size / 1024)}KB)`);

      videos.push({
        thumbnail: `${name}-thumb.jpg`,
        video: file,
        originalName: name
      });
    } catch (err) {
      console.error(`✗ ${file}: ${err instanceof Error ? err.message : err}`);
    }
  }

  return videos;
}

async function main() {
  console.log('Processing carousel assets...\n');

  await mkdir(OUTPUT_DIR, { recursive: true });

  const images = await processImages();
  const videos = await extractVideoThumbnails();

  console.log('\n=== Summary ===\n');
  console.log('Images processed:', images);
  console.log('Videos processed:', videos.map(v => v.originalName));

  console.log('\n=== Files to upload ===');
  console.log('\nImages (to /images/collage/):');
  images.forEach(img => console.log(`  - ${img}`));

  console.log('\nVideo thumbnails (to /images/collage/):');
  videos.forEach(v => console.log(`  - ${v.thumbnail}`));

  console.log('\nVideos (to /videos/carousel/):');
  videos.forEach(v => console.log(`  - ${v.video}`));

  console.log('\nDone! Now run the upload script.');
}

main().catch(console.error);
