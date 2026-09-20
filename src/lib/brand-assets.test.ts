import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'bun:test';

const publicDir = join(import.meta.dir, '../../public');

describe('brand assets', () => {
  test('favicon.svg is the OmniMon mark, not the Astro starter logo', () => {
    const svg = readFileSync(join(publicDir, 'favicon.svg'), 'utf8');
    expect(svg).not.toContain('M50.4 78.5');
    expect(svg.toLowerCase()).toContain('#00f0ff');
    expect(svg).toMatch(/circle/i);
    expect(svg).toMatch(/polyline/i);
  });

  test('favicon.ico is a Windows ICO from the OmniMon app, not a PNG', () => {
    const ico = readFileSync(join(publicDir, 'favicon.ico'));
    expect(ico.length).toBeGreaterThan(1000);
    expect(Array.from(ico.subarray(0, 4))).toEqual([0, 0, 1, 0]);
  });

  test('Layout.astro cache-busts favicons with the build SHA query', () => {
    const layout = readFileSync(join(import.meta.dir, '../layouts/Layout.astro'), 'utf8');
    expect(layout).toContain('favicon.svg?v=');
    expect(layout).toContain('favicon-32.png?v=');
    expect(layout).toContain('favicon.ico?v=');
    expect(layout).toContain('apple-touch-icon.png?v=');
    expect(layout).toContain('src={`/favicon.svg?v=${buildSha}`}');
  });
});
