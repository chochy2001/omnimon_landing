import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'bun:test';
import sharp from 'sharp';
import { HOME_SCREENSHOTS, HOME_SCREENSHOT_VERSION } from './home';

const root = join(import.meta.dir, '../..');
const assets = ['omnimon-screenshot.png', 'omnimon-screenshot.webp', 'omnimon-screenshot.avif', ...HOME_SCREENSHOTS.slice(1).map((shot) => shot.src.slice(1))].sort();

function screenshotFiles(directory: string) {
  return [
    ...readdirSync(directory).filter((name) => name.startsWith('omnimon-screenshot.')),
    ...readdirSync(join(directory, 'screenshots')).map((name) => `screenshots/${name}`),
  ].sort();
}

async function renderedImages(locale: 'en' | 'es') {
  const images: Record<string, string>[] = [];
  const sources: string[] = [];
  const html = readFileSync(join(root, 'dist', locale === 'es' ? 'es/index.html' : 'index.html'), 'utf8');
  await new HTMLRewriter()
    .on('img', { element(el) {
      if (!el.getAttribute('src')?.includes('screenshot')) return;
      images.push(Object.fromEntries(['src', 'alt', 'width', 'height', 'loading'].map((key) => [key, el.getAttribute(key) ?? ''])));
    } })
    .on('picture source', { element(el) { const src = el.getAttribute('srcset'); if (src?.includes('screenshot')) sources.push(src); } })
    .transform(new Response(html)).text();
  return { images, sources };
}

describe('native screenshot delivery contract', () => {
  test('all referenced screenshots ship, with no orphaned captures in public or dist', () => {
    expect(HOME_SCREENSHOT_VERSION).toBe('6.8.1');
    for (const dir of ['public', 'dist']) expect(screenshotFiles(join(root, dir))).toEqual(assets);
  });

  for (const locale of ['en', 'es'] as const) {
    test(`${locale}: rendered images match decoded pixels and optimized assets`, async () => {
      const { images, sources } = await renderedImages(locale);
      expect(images).toHaveLength(4);
      expect(sources).toEqual(['/omnimon-screenshot.avif', '/omnimon-screenshot.webp']);
      expect([...images.map((img) => img.src.slice(1)), ...sources.map((src) => src.slice(1))].sort()).toEqual(assets);
      for (const [index, shot] of HOME_SCREENSHOTS.entries()) {
        const img = images[index];
        const file = join(root, 'dist', shot.src);
        const meta = await sharp(file).metadata();
        expect(img.src).toBe(shot.src);
        expect(img.alt).toBe(shot[locale].alt);
        expect(Number(img.width)).toBe(meta.width);
        expect(Number(img.height)).toBe(meta.height);
        expect(meta.width).toBe(shot.width);
        expect(meta.height).toBe(shot.height);
        expect(img.loading).toBe(index === 0 ? 'eager' : 'lazy');
        if (index > 0) {
          expect(meta.format).toBe('webp');
          expect(statSync(file).size).toBeLessThan(400_000);
        }
      }
      const png = join(root, 'dist/omnimon-screenshot.png');
      expect((await sharp(png).metadata()).format).toBe('png');
      for (const ext of ['webp', 'avif']) {
        const file = join(root, `dist/omnimon-screenshot.${ext}`);
        const meta = await sharp(file).metadata();
        expect(ext === 'webp' ? ['webp'] : ['heif', 'avif']).toContain(meta.format);
        expect(meta.width).toBe(HOME_SCREENSHOTS[0].width);
        expect(meta.height).toBe(HOME_SCREENSHOTS[0].height);
        expect(statSync(file).size).toBeLessThan(statSync(png).size * 0.5);
      }
    });
  }
});


test('lint script is real astro check', () => {
  const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
  expect(pkg.scripts.lint).toBe('astro check');
  expect(pkg.scripts['optimize:screenshot']).toContain('optimize-screenshot');
  expect(pkg.devDependencies['@astrojs/check']).toBeTruthy();
  expect(pkg.devDependencies.typescript).toBeTruthy();
});
