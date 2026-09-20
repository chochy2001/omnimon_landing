import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'bun:test';
import {
  homeHref,
  blogHref,
  switchLocalePath,
  localeFromPath,
  chromeCopy,
  canonicalRedirectPath,
  notFoundCopy,
} from './locale';

describe('locale chrome', () => {
  test('home and blog stay on the active language', () => {
    expect(homeHref('en')).toBe('/');
    expect(homeHref('es')).toBe('/es/');
    expect(blogHref('en')).toBe('/blog/');
    expect(blogHref('es')).toBe('/es/blog/');
  });

  test('path prefix decides the document language', () => {
    expect(localeFromPath('/')).toBe('en');
    expect(localeFromPath('/blog/v6-8-0-release')).toBe('en');
    expect(localeFromPath('/privacy')).toBe('en');
    expect(localeFromPath('/es/')).toBe('es');
    expect(localeFromPath('/es/blog/')).toBe('es');
    expect(localeFromPath('/es/privacy')).toBe('es');
  });

  test('nav labels are visible in both languages', () => {
    expect(chromeCopy.en.download).toBe('Download');
    expect(chromeCopy.es.download).toBe('Descargar');
    expect(chromeCopy.en.theme).toBe('Toggle color theme');
    expect(chromeCopy.es.theme).toBe('Cambiar tema de color');
    expect(chromeCopy.en.langEn).toBe('EN');
    expect(chromeCopy.es.langEs).toBe('ES');
  });

  test('legacy /en aliases redirect to the english home', () => {
    expect(canonicalRedirectPath('/en')).toBe('/');
    expect(canonicalRedirectPath('/en/')).toBe('/');
    expect(canonicalRedirectPath('/')).toBeNull();
    expect(canonicalRedirectPath('/es/')).toBeNull();
    expect(canonicalRedirectPath('/blog/')).toBeNull();
  });

  test('not-found copy follows the URL language, including ErrorDocument paths', () => {
    expect(notFoundCopy('en').h1).toContain('could not find');
    expect(notFoundCopy('es').h1).toContain('No encontramos');
    expect(localeFromPath('/does-not-exist')).toBe('en');
    expect(localeFromPath('/es/does-not-exist')).toBe('es');
  });

  test('language switch maps home, legal, blog index and release posts', () => {
    expect(switchLocalePath('/', 'en')).toBe('/es/');
    expect(switchLocalePath('/es/', 'es')).toBe('/');
    expect(switchLocalePath('/blog/', 'en')).toBe('/es/blog/');
    expect(switchLocalePath('/es/blog/', 'es')).toBe('/blog/');
    expect(switchLocalePath('/blog/v6-8-0-release/', 'en')).toBe(
      '/es/blog/v6-8-0-release-es/',
    );
    expect(switchLocalePath('/es/blog/v6-8-0-release-es/', 'es')).toBe(
      '/blog/v6-8-0-release/',
    );
    expect(switchLocalePath('/privacy/', 'en')).toBe('/es/privacy/');
    expect(switchLocalePath('/es/privacy/', 'es')).toBe('/privacy/');
    expect(switchLocalePath('/terms', 'en')).toBe('/es/terms/');
    expect(switchLocalePath('/es/terms', 'es')).toBe('/terms/');
  });

  test('spanish ErrorDocument 404 patches nav, footer home, and language pill', () => {
    const page = readFileSync(join(import.meta.dir, '../pages/404.astro'), 'utf8');
    const layout = readFileSync(join(import.meta.dir, '../layouts/Layout.astro'), 'utf8');
    const switcher = readFileSync(
      join(import.meta.dir, '../components/LanguageSwitcher.astro'),
      'utf8',
    );

    expect(layout).toContain('id="omnimon-nav-home"');
    expect(layout).toContain('id="omnimon-nav-blog"');
    expect(layout).toContain('id="omnimon-footer-home"');
    expect(switcher).toContain('id="omnimon-lang-en"');
    expect(switcher).toContain('id="omnimon-lang-es"');

    for (const id of [
      'omnimon-nav-home',
      'omnimon-nav-blog',
      'omnimon-footer-home',
      'omnimon-lang-en',
      'omnimon-lang-es',
    ]) {
      expect(page).toContain(`getElementById('${id}')`);
    }
    expect(page).toContain("setAttribute('href', '/es/')");
    expect(page).toContain("setAttribute('href', '/es/blog/')");
    expect(page).toContain("removeAttribute('aria-current')");
    expect(page).toContain("setAttribute('aria-current', 'page')");
    expect(page).toContain("classList.remove('is-active')");
    expect(page).toContain("classList.add('is-active')");
  });

  test('deploy docs treat /es/ as a Spanish home and /en/ as the 301 to /', () => {
    const deployment = readFileSync(
      join(import.meta.dir, '../../.github/DEPLOYMENT.md'),
      'utf8',
    );
    const workflow = readFileSync(
      join(import.meta.dir, '../../.github/workflows/deploy-hostinger.yml'),
      'utf8',
    );
    expect(deployment).not.toMatch(/\/es\/[`']?, que redirige a/);
    expect(workflow).not.toContain('/es/ -> /');
    expect(deployment).toMatch(/\/en\/.*301|\/en\/.*redirige|hoy `\/en\/`/i);
    expect(workflow).toContain('/en/ -> /');
    expect(workflow).toMatch(/\/es\/.*home|\/es\/ es /i);
  });
});
