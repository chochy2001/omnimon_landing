import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'bun:test';

function src(rel: string): string {
  return readFileSync(join(import.meta.dir, '..', rel), 'utf8');
}

describe('first-party fonts', () => {
  test('layout loads no Google Fonts hosts', () => {
    const layout = src('layouts/Layout.astro');
    expect(layout).not.toContain('fonts.googleapis.com');
    expect(layout).not.toContain('fonts.gstatic.com');
  });

  test('font-face rules point at self-hosted latin woff2 files', () => {
    const css = src('styles/global.css');
    const faces = [
      'ibm-plex-sans-400',
      'ibm-plex-sans-500',
      'ibm-plex-sans-600',
      'ibm-plex-sans-700',
      'jetbrains-mono-400',
      'jetbrains-mono-500',
      'jetbrains-mono-700',
    ];
    for (const face of faces) {
      expect(css).toContain(`/fonts/${face}.woff2`);
      expect(existsSync(join(import.meta.dir, '..', '..', 'public', 'fonts', `${face}.woff2`))).toBe(true);
    }
    expect(css).toContain('font-display: swap');
  });
});

describe('footer and banner legal links', () => {
  test('footer links privacy, terms, and cookies', () => {
    const layout = src('layouts/Layout.astro');
    expect(layout).toContain("legalLinkLabel(lang, 'privacy')");
    expect(layout).toContain("legalLinkLabel(lang, 'terms')");
    expect(layout).toContain("legalLinkLabel(lang, 'cookies')");
  });

  test('nav badge shows the published tag, not the pre-release', () => {
    const layout = src('layouts/Layout.astro');
    expect(layout).toContain('v{PUBLISHED_VERSION}');
    expect(layout).not.toContain('v{OMNIMON_VERSION}');
  });

  test('banner links all three legal pages', () => {
    const banner = src('components/ui/CookieBanner.astro');
    expect(banner).toContain('data-omnimon-banner-privacy');
    expect(banner).toContain('data-omnimon-banner-terms');
    expect(banner).toContain('data-omnimon-banner-cookies');
  });
});

describe('configure preferences dialog', () => {
  test('banner carries an inline prefs panel with save and cancel', () => {
    const banner = src('components/ui/CookieBanner.astro');
    expect(banner).toContain('data-omnimon-cookie-prefs');
    expect(banner).toContain('data-omnimon-prefs-analytics');
    expect(banner).toContain('data-omnimon-prefs-save');
    expect(banner).toContain('data-omnimon-prefs-cancel');
    expect(banner).toContain('aria-expanded');
  });

  test('configure no longer navigates away to the privacy page', () => {
    const banner = src('components/ui/CookieBanner.astro');
    expect(banner).not.toContain('window.location.assign');
  });
});

describe('terminal contrast exemption', () => {
  test('light-theme remap is undone inside dark terminal panels', () => {
    const css = src('styles/global.css');
    for (const utility of ['text-cyan-300', 'text-orange-300', 'text-emerald-300', 'text-slate-300', 'text-slate-400']) {
      expect(css).toContain(`html:not(.dark) .terminal-panel .${utility}`);
    }
  });
});

describe('unreleased blog posts are framed as previews', () => {
  const previews = [
    'pages/blog/v6-7-0-release.astro',
    'pages/blog/v6-8-0-release.astro',
    'pages/es/blog/v6-7-0-release-es.astro',
    'pages/es/blog/v6-8-0-release-es.astro',
  ];

  for (const rel of previews) {
    test(`${rel} carries a preview badge, not a release badge`, () => {
      const body = src(rel);
      expect(body).not.toContain('>New release<');
      expect(body).not.toContain('>Nuevo release<');
      expect(body).not.toContain('>Nueva version<');
      expect(body.includes('>Preview<') || body.includes('>Vista previa<')).toBe(true);
    });
  }

  test('6.7.0 download sections name the published tag', () => {
    for (const rel of ['pages/blog/v6-7-0-release.astro', 'pages/es/blog/v6-7-0-release-es.astro']) {
      expect(src(rel)).toContain('v6.6.6');
    }
  });
});
