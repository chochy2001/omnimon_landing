import { readFileSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'bun:test';

const root = join(import.meta.dir, '../..');
const pub = join(root, 'public');
const home = readFileSync(join(root, 'src/components/HomePage.astro'), 'utf8');

describe('screenshot optimization', () => {
  test('WebP and AVIF variants exist, same dimensions, much smaller than PNG', async () => {
    const sharp = (await import('sharp')).default;
    const png = join(pub, 'omnimon-screenshot.png');
    const webp = join(pub, 'omnimon-screenshot.webp');
    const avif = join(pub, 'omnimon-screenshot.avif');
    expect(existsSync(webp)).toBe(true);
    expect(existsSync(avif)).toBe(true);
    const pngMeta = await sharp(png).metadata();
    for (const p of [webp, avif]) {
      const m = await sharp(p).metadata();
      expect(m.width).toBe(pngMeta.width);
      expect(m.height).toBe(pngMeta.height);
      // at least 50% smaller than 929KB PNG
      expect(statSync(p).size).toBeLessThan(statSync(png).size * 0.5);
    }
    expect((await sharp(webp).metadata()).format).toBe('webp');
    // sharp reports AVIF container as heif
    expect(['heif', 'avif']).toContain((await sharp(avif).metadata()).format);
  });

  test('HomePage uses <picture> AVIF>WebP>PNG fallback without layout change', () => {
    expect(home).toContain('<picture>');
    expect(home).toContain('srcset="/omnimon-screenshot.avif"');
    expect(home).toContain('type="image/avif"');
    expect(home).toContain('srcset="/omnimon-screenshot.webp"');
    expect(home).toContain('type="image/webp"');
    // PNG fallback preserved
    expect(home).toContain('src="/omnimon-screenshot.png"');
    // intrinsic size unchanged -> no CLS/layout shift
    expect(home).toContain('width="1728"');
    expect(home).toContain('height="1011"');
    // AVIF before WebP before img (browser picks first supported)
    expect(home.indexOf('image/avif')).toBeLessThan(home.indexOf('image/webp'));
    expect(home.indexOf('image/webp')).toBeLessThan(home.indexOf('src="/omnimon-screenshot.png"'));
  });

  test('lint script is real astro check', () => {
    const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
    expect(pkg.scripts.lint).toBe('astro check');
    expect(pkg.scripts['optimize:screenshot']).toContain('optimize-screenshot');
    expect(pkg.devDependencies['@astrojs/check']).toBeTruthy();
    expect(pkg.devDependencies.typescript).toBeTruthy();
  });
});
