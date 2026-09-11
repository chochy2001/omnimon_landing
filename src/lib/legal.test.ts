import { describe, expect, test } from 'bun:test';
import {
  legalHref,
  legalLinkLabel,
  resolveLegalStrings,
} from './legal';

describe('legal routes', () => {
  test('english privacy and terms are unprefixed', () => {
    expect(legalHref('en', 'privacy')).toBe('/privacy');
    expect(legalHref('en', 'terms')).toBe('/terms');
  });

  test('spanish privacy and terms live under /es', () => {
    expect(legalHref('es', 'privacy')).toBe('/es/privacy');
    expect(legalHref('es', 'terms')).toBe('/es/terms');
  });
});

describe('legal copy', () => {
  test('exposes bilingual titles and last-updated date', () => {
    const es = resolveLegalStrings('es');
    const en = resolveLegalStrings('en');
    expect(es.privacyTitle.toLowerCase()).toContain('privacidad');
    expect(en.privacyTitle).toContain('Privacy');
    expect(es.termsTitle).toContain('Terminos');
    expect(en.termsTitle).toContain('Terms');
    expect(es.updated).toBe('2026-09-11');
    expect(en.updated).toBe('2026-09-11');
  });

  test('banner labels stay locale-specific', () => {
    expect(legalLinkLabel('es', 'privacy')).toContain('privacidad');
    expect(legalLinkLabel('en', 'privacy')).toContain('Privacy');
    expect(legalLinkLabel('es', 'terms')).toContain('Terminos');
    expect(legalLinkLabel('en', 'terms')).toContain('Terms');
  });

  test('does not claim a published 6.7.0 Mac production fleet', () => {
    const es = resolveLegalStrings('es');
    const en = resolveLegalStrings('en');
    expect(es.privacyBody.join(' ')).not.toMatch(/prod Mac de todos/i);
    expect(en.privacyBody.join(' ')).not.toMatch(/every Mac in production/i);
  });
});
