/**
 * Upload carousel assets to Bunny.net Storage
 * - Images go to /images/collage/
 * - Videos go to /videos/carousel/
 *
 * Usage: npx tsx scripts/upload-carousel-assets.ts
 */

import 'dotenv/config';
import { readFile, stat } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const STORAGE_ZONE = process.env.PUBLIC_BUNNY_STORAGE_ZONE || 'skyler-storage';
const API_KEY = process.env.BUNNY_API_KEY;
const STORAGE_API_URL = `https://storage.bunnycdn.com/${STORAGE_ZONE}`;
const CDN_URL = process.env.PUBLIC_BUNNY_CDN_URL || 'https://skyler-storage.b-cdn.net';

if (!API_KEY) {
  console.error('BUNNY_API_KEY not found in environment variables');
  process.exit(1);
}

// Files to upload - portrait carousel only
const CAROUSEL_IMAGES = [
  'pintuck2.jpg',
  'corset-bias-tape-chanel5.jpg',
  'gathering-thumbnail4.jpg',
  'gathering-thumbnail5.jpg',
  'chanel-on-the-table-thumb.jpg'
];

const CAROUSEL_VIDEOS = [
  { local: 'chanel on the table.mp4', remote: 'chanel-on-the-table.mp4' }
];

function getContentType(filePath: string): string {
  const ext = filePath.split('.').pop()?.toLowerCase();
  const contentTypes: Record<string, string> = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'webp': 'image/webp',
    'mp4': 'video/mp4',
    'mov': 'video/quicktime',
    'webm': 'video/webm'
  };
  return contentTypes[ext || ''] || 'application/octet-stream';
}

async function uploadFile(localPath: string, remotePath: string): Promise<boolean> {
  try {
    const fileBuffer = await readFile(localPath);
    const fileStats = await stat(localPath);
    const contentType = getContentType(localPath);
    const sizeMB = (fileStats.size / 1024 / 1024).toFixed(2);

    console.log(`Uploading: ${localPath} -> ${remotePath} (${sizeMB}MB)`);

    const response = await fetch(`${STORAGE_API_URL}${remotePath}`, {
      method: 'PUT',
      headers: {
        'AccessKey': API_KEY || '',
        'Content-Type': contentType
      },
      body: fileBuffer
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    console.log(`  Uploaded successfully`);
    return true;
  } catch (error) {
    console.error(`  Failed: ${error}`);
    return false;
  }
}

async function main() {
  console.log('Uploading carousel assets to Bunny.net...\n');

  let successCount = 0;
  let failCount = 0;

  // Upload images
  console.log('=== Uploading Images ===\n');
  for (const image of CAROUSEL_IMAGES) {
    const localPath = join(__dirname, '..', 'static', 'images', 'collage', image);
    const remotePath = `/images/collage/${image}`;
    const success = await uploadFile(localPath, remotePath);
    if (success) successCount++;
    else failCount++;
  }

  // Upload videos
  console.log('\n=== Uploading Videos ===\n');
  for (const video of CAROUSEL_VIDEOS) {
    const localPath = join(__dirname, '..', 'assets', 'new-images', video.local);
    const remotePath = `/videos/carousel/${video.remote}`;
    const success = await uploadFile(localPath, remotePath);
    if (success) successCount++;
    else failCount++;
  }

  console.log('\n=== Summary ===');
  console.log(`Success: ${successCount}`);
  console.log(`Failed: ${failCount}`);

  if (failCount === 0) {
    console.log('\n=== CDN URLs ===\n');
    console.log('Images:');
    CAROUSEL_IMAGES.forEach(img => {
      console.log(`  ${CDN_URL}/images/collage/${img}`);
    });
    console.log('\nVideos:');
    CAROUSEL_VIDEOS.forEach(vid => {
      console.log(`  ${CDN_URL}/videos/carousel/${vid.remote}`);
    });
  }
}

main().catch(console.error);
