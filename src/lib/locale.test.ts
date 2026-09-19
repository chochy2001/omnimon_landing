import { describe, expect, test } from 'bun:test';
import {
  homeHref,
  blogHref,
  switchLocalePath,
  localeFromPath,
  chromeCopy,
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
});
