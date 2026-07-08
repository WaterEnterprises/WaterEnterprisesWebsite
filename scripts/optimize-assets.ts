import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(fileURLToPath(import.meta.url), '../..');
const publicDir = path.join(root, 'public');
const logoPath = path.join(publicDir, 'logo.png');

const meta = await sharp(logoPath).metadata();
console.log(`source logo: ${meta.width}x${meta.height}, ${meta.format}`);

// Downscale source to a crisp-but-small 256px, keep transparency.
const resized = await sharp(logoPath)
  .resize(256, 256, { fit: 'inside', withoutEnlargement: true })
  .png({ compressionLevel: 9 })
  .toBuffer();
await sharp(resized).toFile(logoPath);
console.log('wrote resized public/logo.png');

// Favicon 64x64
await sharp(resized)
  .resize(64, 64, { fit: 'inside', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png({ compressionLevel: 9 })
  .toFile(path.join(publicDir, 'favicon.png'));
console.log('wrote public/favicon.png');

// PWA + iOS icons (transparent background, contain)
const transparent = (size: number, out: string) =>
  sharp(resized)
    .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9 })
    .toFile(path.join(publicDir, out));

await transparent(192, 'pwa-192.png');
await transparent(512, 'pwa-512.png');
await transparent(180, 'apple-touch-icon.png');
console.log('wrote pwa-192/512 + apple-touch-icon');

// Maskable 512x512: logo inside the safe zone on a full-bleed brand background.
await sharp({
  create: { width: 512, height: 512, channels: 4, background: { r: 15, g: 23, b: 42, alpha: 1 } },
})
  .composite([
    {
      input: await sharp(resized)
        .resize(320, 320, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toBuffer(),
      gravity: 'center',
    },
  ])
  .png({ compressionLevel: 9 })
  .toFile(path.join(publicDir, 'maskable-512.png'));
console.log('wrote maskable-512.png');

const finalMeta = await sharp(logoPath).metadata();
console.log(`final logo: ${finalMeta.width}x${finalMeta.height}`);
