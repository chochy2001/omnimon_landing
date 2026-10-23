/**
 * Generates optimized WebP/AVIF variants of public/omnimon-screenshot.png.
 * Keeps the PNG as fallback for <picture>. Run: bun run optimize:screenshot
 * Uses sharp (already a devDependency for generate-og.mjs).
 */
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { statSync } from 'node:fs';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = resolve(__dirname, '..', 'public');
const src = resolve(publicDir, 'omnimon-screenshot.png');

const meta = await sharp(src).metadata();
console.log(`Source: ${meta.width}x${meta.height} ${meta.format} ${(statSync(src).size / 1024).toFixed(0)}KB`);

const webpPath = resolve(publicDir, 'omnimon-screenshot.webp');
const avifPath = resolve(publicDir, 'omnimon-screenshot.avif');

await sharp(src).webp({ quality: 82, effort: 6 }).toFile(webpPath);
await sharp(src).avif({ quality: 65, effort: 6 }).toFile(avifPath);

for (const p of [webpPath, avifPath]) {
  const m = await sharp(p).metadata();
  console.log(`Generated ${p.split('/').pop()}: ${m.width}x${m.height} ${m.format} ${(statSync(p).size / 1024).toFixed(1)}KB`);
}
