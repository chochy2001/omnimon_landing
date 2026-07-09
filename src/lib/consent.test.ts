import { describe, expect, test } from 'bun:test';
import {
  buildConsentPayload,
  buildPostHogCspFragments,
  detectLocale,
  hasAnalyticsConsent,
  parseConsent,
  resolveBannerStrings,
  serializeConsent,
  COOKIE_CONSENT_DURATION_MS,
} from './consent';

describe('detectLocale', () => {
  test('defaults to es', () => {
    expect(detectLocale(undefined)).toBe('es');
    expect(detectLocale(null)).toBe('es');
    expect(detectLocale('')).toBe('es');
    expect(detectLocale('es-MX')).toBe('es');
  });

  test('detects english prefixes', () => {
    expect(detectLocale('en')).toBe('en');
    expect(detectLocale('en-US')).toBe('en');
  });
});

describe('parseConsent / hasAnalyticsConsent', () => {
  const now = 1_700_000_000_000;

  test('returns null for missing or corrupt storage', () => {
    expect(parseConsent(null, now)).toBeNull();
    expect(parseConsent('{not-json', now)).toBeNull();
    expect(hasAnalyticsConsent(null, now)).toBe(false);
  });

  test('accepts valid accepted consent', () => {
    const raw = serializeConsent(buildConsentPayload(true, now));
    expect(parseConsent(raw, now)?.accepted).toBe(true);
    expect(hasAnalyticsConsent(raw, now)).toBe(true);
  });

  test('rejects when accepted is false', () => {
    const raw = serializeConsent(buildConsentPayload(false, now));
    expect(hasAnalyticsConsent(raw, now)).toBe(false);
  });

  test('expires after duration', () => {
    const raw = serializeConsent(buildConsentPayload(true, now));
    const expiredAt = now + COOKIE_CONSENT_DURATION_MS + 1;
    expect(parseConsent(raw, expiredAt)).toBeNull();
    expect(hasAnalyticsConsent(raw, expiredAt)).toBe(false);
  });

  test('rejects non-finite timestamps', () => {
    expect(parseConsent(JSON.stringify({ accepted: true, timestamp: 'nope' }), now)).toBeNull();
  });
});

describe('banner strings and CSP fragments', () => {
  test('resolveBannerStrings falls back to es', () => {
    expect(resolveBannerStrings('es').accept).toContain('Aceptar');
    expect(resolveBannerStrings('en').accept).toContain('Accept');
  });

  test('buildPostHogCspFragments is empty without host', () => {
    expect(buildPostHogCspFragments(null)).toEqual({ scriptSrcExtra: '', connectSrcExtra: '' });
  });

  test('buildPostHogCspFragments maps assets host', () => {
    const fragments = buildPostHogCspFragments('https://us.i.posthog.com');
    expect(fragments.connectSrcExtra).toContain('https://us.i.posthog.com');
    expect(fragments.scriptSrcExtra).toContain('https://us-assets.i.posthog.com');
  });
});
