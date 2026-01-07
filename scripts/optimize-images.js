/**
 * Image optimization script for fabric library images
 * 
 * Usage: node scripts/optimize-images.js
 * 
 * Requires: npm install sharp
 */

import sharp from 'sharp';
import { readdir, mkdir } from 'fs/promises';
import { join, basename, extname } from 'path';

const INPUT_DIR = 'assets/fabric-library';
const OUTPUT_DIR = 'static/images/fabrics';

// Target dimensions and quality
const MAX_WIDTH = 800;
const MAX_HEIGHT = 600;
const QUALITY = 80;

async function optimizeImages() {
  console.log('Optimizing fabric library images...\n');

  // Ensure output directory exists
  await mkdir(OUTPUT_DIR, { recursive: true });

  // Get all image files
  const files = await readdir(INPUT_DIR);
  const imageFiles = files.filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f));

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
        .resize(MAX_WIDTH, MAX_HEIGHT, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ quality: QUALITY, progressive: true })
        .toFile(outputPath);

      console.log(`✓ ${file} -> ${name}.jpg (${Math.round(info.size / 1024)}KB)`);
    } catch (err) {
      console.error(`✗ ${file}: ${err.message}`);
    }
  }

  console.log('\nDone!');
}

optimizeImages().catch(console.error);
