/**
 * Process video thumbnails to match carousel images
 */

import sharp from 'sharp';

const MAX_WIDTH = 1600;
const QUALITY = 85;

async function processVideoThumbs() {
  console.log('Processing video thumbnails...\n');

  // Chanel video thumbnail - portrait, needs rotation
  const chanelInfo = await sharp('static/images/collage/chanel-table-video.jpg')
    .rotate(-90)
    .resize(MAX_WIDTH, undefined, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: QUALITY, progressive: true })
    .toFile('static/images/collage/chanel-table-video-processed.jpg');

  console.log(`✓ chanel-table-video.jpg -> ${chanelInfo.width}x${chanelInfo.height}`);

  // Pintuck3 video thumbnail - already landscape
  const pintuckInfo = await sharp('static/images/collage/pintuck3-video.jpg')
    .resize(MAX_WIDTH, undefined, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: QUALITY, progressive: true })
    .toFile('static/images/collage/pintuck3-video-processed.jpg');

  console.log(`✓ pintuck3-video.jpg -> ${pintuckInfo.width}x${pintuckInfo.height}`);

  console.log('\nDone!');
}

processVideoThumbs().catch(console.error);
