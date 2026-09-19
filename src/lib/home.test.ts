import { describe, expect, test } from 'bun:test';
import { OMNIMON_VERSION } from '../consts';
import { homeCopy } from './home';

describe('home copy', () => {
  test('english and spanish homes are distinct documents', () => {
    expect(homeCopy.en.lang).toBe('en');
    expect(homeCopy.es.lang).toBe('es');
    expect(homeCopy.en.h1).not.toBe(homeCopy.es.h1);
    expect(homeCopy.en.ctaDownload).toContain('Download');
    expect(homeCopy.es.ctaDownload).toContain('Descargar');
    expect(homeCopy.en.navDownload).toBe('Download');
    expect(homeCopy.es.navDownload).toBe('Descargar');
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
