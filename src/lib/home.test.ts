import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'bun:test';
import { OMNIMON_VERSION } from '../consts';
import { homeCopy } from './home';

describe('home copy', () => {
  test('english and spanish homes are distinct documents', () => {
    expect(homeCopy.en.lang).toBe('en');
    expect(homeCopy.es.lang).toBe('es');
    expect(homeCopy.en.h1).not.toBe(homeCopy.es.h1);
    expect(homeCopy.en.ctaDownload).toBe('Download latest');
    expect(homeCopy.es.ctaDownload).toBe('Descargar ultima version');
    expect(homeCopy.en.ctaDownload).not.toContain(OMNIMON_VERSION);
    expect(homeCopy.es.ctaDownload).not.toContain(OMNIMON_VERSION);
    expect(homeCopy.en.navDownload).toBe('Download');
    expect(homeCopy.es.navDownload).toBe('Descargar');
  });

  test('download CTA and checksum example do not imply a published 6.8.0 DMG', () => {
    const page = readFileSync(join(import.meta.dir, '../components/HomePage.astro'), 'utf8');
    expect(homeCopy.en.ctaDownload).not.toMatch(/6\.8\.0/);
    expect(homeCopy.es.ctaDownload).not.toMatch(/6\.8\.0/);
    expect(page).not.toContain('OmniMon-{OMNIMON_VERSION}-macOS-Universal.dmg');
    expect(page).toContain('OmniMon-6.6.6-macOS-Universal.dmg');
  });

  test('both locales advertise the current version and a real screenshot', () => {
    expect(homeCopy.en.title).toContain(OMNIMON_VERSION);
    expect(homeCopy.es.title).toContain(OMNIMON_VERSION);
    expect(homeCopy.en.screenshotAlt.toLowerCase()).toContain('omnimon');
    expect(homeCopy.es.screenshotAlt.toLowerCase()).toContain('omnimon');
    expect(homeCopy.en.highlights).toHaveLength(4);
    expect(homeCopy.es.highlights).toHaveLength(4);
    expect(homeCopy.en.highlights[0]?.title.toLowerCase()).toContain('memory guard');
  });
});
