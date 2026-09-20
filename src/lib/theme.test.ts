import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'bun:test';
import { resolveInitialTheme } from './theme';

describe('resolveInitialTheme', () => {
  test('stored light or dark always wins', () => {
    expect(resolveInitialTheme('light', true)).toBe('light');
    expect(resolveInitialTheme('dark', false)).toBe('dark');
  });

  test('falls back to the operating-system preference', () => {
    expect(resolveInitialTheme(null, true)).toBe('dark');
    expect(resolveInitialTheme(null, false)).toBe('light');
    expect(resolveInitialTheme('nonsense', true)).toBe('dark');
    expect(resolveInitialTheme(undefined, false)).toBe('light');
  });
});

function srgbToLin(channel: number): number {
  const s = channel / 255;
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

function hexLuminance(hex: string): number {
  const raw = hex.replace('#', '').trim();
  const n = Number.parseInt(raw.length === 3 ? raw.split('').map((c) => c + c).join('') : raw, 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return 0.2126 * srgbToLin(r) + 0.7152 * srgbToLin(g) + 0.0722 * srgbToLin(b);
}

function contrastRatio(fg: string, bg: string): number {
  const a = hexLuminance(fg);
  const b = hexLuminance(bg);
  const [hi, lo] = a > b ? [a, b] : [b, a];
  return (hi + 0.05) / (lo + 0.05);
}

function cssVarHex(css: string, name: string): string {
  const root = css.match(/:root\s*\{([\s\S]*?)\n\}/);
  expect(root).toBeTruthy();
  const match = root![1].match(new RegExp(`${name}:\\s*(#[0-9a-fA-F]{3,8})\\s*;`));
  expect(match).toBeTruthy();
  return match![1];
}

function lightRuleBody(css: string, selector: string): string {
  const needle = `html:not(.dark) .${selector}`;
  const idx = css.indexOf(needle);
  expect(idx).toBeGreaterThan(-1);
  const brace = css.indexOf('{', idx);
  const end = css.indexOf('}', brace);
  expect(brace).toBeGreaterThan(idx);
  expect(end).toBeGreaterThan(brace);
  return css.slice(brace + 1, end);
}

describe('light theme pale kicker remaps', () => {
  const css = readFileSync(join(import.meta.dir, '../styles/global.css'), 'utf8');

  const remaps: Array<[string, string]> = [
    ['text-sky-200', '--accent-cyan'],
    ['text-sky-300', '--accent-cyan'],
    ['text-cyan-300', '--accent-cyan'],
    ['text-cyan-400', '--accent-cyan'],
    ['text-emerald-200', '--accent-soft'],
    ['text-emerald-300', '--accent-soft'],
    ['text-orange-200', '--accent'],
    ['text-orange-300', '--accent'],
    ['hover\\:text-sky-300:hover', '--accent-cyan'],
  ];

  test('remaps pale Tailwind kickers to light-theme tokens', () => {
    for (const [selector, token] of remaps) {
      expect(lightRuleBody(css, selector)).toContain(`var(${token})`);
    }
  });

  test('remap destination tokens meet WCAG AA against light surfaces', () => {
    const bgBase = cssVarHex(css, '--bg-base');
    const accentCyan = cssVarHex(css, '--accent-cyan');
    const accent = cssVarHex(css, '--accent');
    const accentSoft = cssVarHex(css, '--accent-soft');
    const textMain = cssVarHex(css, '--text-main');
    const elevated = '#ffffff';

    for (const fg of [accentCyan, accent, accentSoft, textMain]) {
      expect(contrastRatio(fg, bgBase)).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(fg, elevated)).toBeGreaterThanOrEqual(4.5);
    }
  });
});
