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

  test('cookies policy lives next to privacy in both locales', () => {
    expect(legalHref('en', 'cookies')).toBe('/cookies');
    expect(legalHref('es', 'cookies')).toBe('/es/cookies');
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
    expect(es.cookiesTitle.toLowerCase()).toContain('cookies');
    expect(en.cookiesTitle).toContain('Cookie');
    expect(es.updated).toBe('2026-09-25');
    expect(en.updated).toBe('2026-09-25');
  });

  test('banner labels stay locale-specific', () => {
    expect(legalLinkLabel('es', 'privacy')).toContain('privacidad');
    expect(legalLinkLabel('en', 'privacy')).toContain('Privacy');
    expect(legalLinkLabel('es', 'terms')).toContain('Terminos');
    expect(legalLinkLabel('en', 'terms')).toContain('Terms');
    expect(legalLinkLabel('es', 'cookies')).toContain('cookies');
    expect(legalLinkLabel('en', 'cookies')).toContain('Cookie');
  });

  test('does not claim a published 6.7.0 Mac production fleet', () => {
    const es = resolveLegalStrings('es');
    const en = resolveLegalStrings('en');
    expect(es.privacyBody.join(' ')).not.toMatch(/prod Mac de todos/i);
    expect(en.privacyBody.join(' ')).not.toMatch(/every Mac in production/i);
  });

  test('privacy names the controller, the 2025 law, and ARCO contact', () => {
    const es = resolveLegalStrings('es');
    const en = resolveLegalStrings('en');
    for (const body of [es.privacyBody.join(' '), en.privacyBody.join(' ')]) {
      expect(body).toContain('Jorge Salgado Miranda');
      expect(body).toContain('20/03/2025');
      expect(body).toContain('jorgesalgadomiranda@protonmail.com');
      expect(body).toContain('PostHog');
    }
  });

  test('terms name the published tag and the no-payments rule', () => {
    const es = resolveLegalStrings('es');
    const en = resolveLegalStrings('en');
    expect(es.termsBody.join(' ')).toContain('v6.6.6');
    expect(en.termsBody.join(' ')).toContain('v6.6.6');
    expect(es.termsBody.join(' ')).toContain('no cobra');
    expect(en.termsBody.join(' ')).toContain('no payments');
  });

  test('cookies policy names the consent storage keys', () => {
    const es = resolveLegalStrings('es');
    const en = resolveLegalStrings('en');
    for (const body of [es.cookiesBody.join(' '), en.cookiesBody.join(' ')]) {
      expect(body).toContain('omnimon-cookie-consent');
      expect(body).toContain('365');
    }
  });
});
