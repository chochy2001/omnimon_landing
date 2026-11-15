/** Optimize native screenshots. Optional argument: directory of original PNGs. */
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdirSync, statSync } from 'node:fs';
import sharp from 'sharp';

const publicDir = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'public');
const originals = process.argv[2];
if (originals) {
  await sharp(resolve(originals, 'overview.png')).png().toFile(resolve(publicDir, 'omnimon-screenshot.png'));
  mkdirSync(resolve(publicDir, 'screenshots'), { recursive: true });
  for (const name of ['processes', 'network', 'zombie-killer']) {
    await sharp(resolve(originals, `${name}.png`)).webp({ quality: 90, effort: 6 }).toFile(resolve(publicDir, `screenshots/${name}.webp`));
  }
  // Downscaled structural-comparison fixture used by the FTPS gate tests.
  await sharp(resolve(originals, 'overview.png')).resize({ width: 1280 }).png().toFile(resolve(publicDir, '../scripts/tests/testdata/served-omnimon-screenshot.png'));
}
const source = resolve(publicDir, 'omnimon-screenshot.png');
for (const format of ['webp', 'avif']) {
  const dest = resolve(publicDir, `omnimon-screenshot.${format}`);
  const pipeline = sharp(source);
  await (format === 'webp' ? pipeline.webp({ quality: 90, effort: 6 }) : pipeline.avif({ quality: 75, effort: 6 })).toFile(dest);
  const meta = await sharp(dest).metadata();
  console.log(`${dest.split('/').pop()}: ${meta.width}x${meta.height}, ${statSync(dest).size} bytes`);
}
