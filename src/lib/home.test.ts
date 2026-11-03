import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'bun:test';
import { OMNIMON_VERSION, PUBLISHED_VERSION } from '../consts';
import { homeCopy } from './home';

describe('home copy', () => {
  test('english and spanish homes are distinct documents', () => {
    expect(homeCopy.en.lang).toBe('en');
    expect(homeCopy.es.lang).toBe('es');
    expect(homeCopy.en.h1).not.toBe(homeCopy.es.h1);
    expect(homeCopy.en.ctaDownload).toBe('Download latest');
    expect(homeCopy.es.ctaDownload).toBe('Descargar última versión');
    expect(homeCopy.en.ctaDownload).not.toContain(OMNIMON_VERSION);
    expect(homeCopy.es.ctaDownload).not.toContain(OMNIMON_VERSION);
    expect(homeCopy.en.navDownload).toBe('Download');
    expect(homeCopy.es.navDownload).toBe('Descargar');
  });

  test('download CTA and checksum example match the published 6.8.0 DMG', () => {
    const page = readFileSync(join(import.meta.dir, '../components/HomePage.astro'), 'utf8');
    expect(OMNIMON_VERSION).toBe('6.8.0');
    expect(PUBLISHED_VERSION).toBe('6.8.0');
    expect(homeCopy.en.ctaDownload).not.toMatch(/6\.8\.0/);
    expect(homeCopy.es.ctaDownload).not.toMatch(/6\.8\.0/);
    expect(page).toContain(`OmniMon-${PUBLISHED_VERSION}-macOS-Universal.dmg`);
    expect(page).toContain('OmniMon-6.8.0-macOS-Universal.dmg');
    expect(page).not.toContain('OmniMon-6.6.6-macOS-Universal.dmg');
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

  test('published 6.8.0 release is framed as shipped, never as an unreleased preview', () => {
    for (const copy of [homeCopy.en, homeCopy.es]) {
      expect(copy.releaseWord).toBe('Release');
      expect(copy.releaseKicker).toBe(`Release ${OMNIMON_VERSION}`);
      expect(copy.releaseDate).toBe('26 Oct 2026');
      expect(copy.lead.toLowerCase()).not.toContain('pre-release');
      expect(copy.description.toLowerCase()).not.toContain('pre-release');
      expect(copy.releaseH2.toLowerCase()).not.toContain('pre-release');
    }
    expect(homeCopy.en.badgeNew).toBe('New');
    expect(homeCopy.es.badgeNew).toBe('Nuevo');
    expect(homeCopy.en.snapshotKicker).toBe('Release snapshot');
    expect(homeCopy.es.snapshotKicker).toBe('Vista del release');
  });

  test('download and status sections name the published tag without pre-release suffixes', () => {
    for (const copy of [homeCopy.en, homeCopy.es]) {
      expect(copy.downloadH2).not.toContain(OMNIMON_VERSION);
      expect(copy.downloadLead).toContain(`v${PUBLISHED_VERSION}`);
    }
    const page = readFileSync(join(import.meta.dir, '../components/HomePage.astro'), 'utf8');
    expect(page).toContain('version: {PUBLISHED_VERSION}');
    expect(page).not.toContain('pre-release');
    expect(page).toContain('[DONE] OmniMon {PUBLISHED_VERSION} is ready');
  });
});
