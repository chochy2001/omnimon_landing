/**
 * Shared cookie-consent helpers for OmniMon landing.
 * Used by CookieBanner and PostHogInit client scripts.
 */

export const COOKIE_CONSENT_KEY = 'omnimon-cookie-consent';
export const COOKIE_CONSENT_EVENT = 'omnimon-cookie-consent';
export const COOKIE_CONSENT_VERSION = 1;
export const COOKIE_CONSENT_DURATION_MS = 365 * 24 * 60 * 60 * 1000;

export type ConsentRecord = {
  accepted: boolean;
  timestamp: number;
  version: number;
};

export type ConsentLocale = 'es' | 'en';

export const CONSENT_STRINGS: Record<
  ConsentLocale,
  {
    title: string;
    body: string;
    accept: string;
    reject: string;
    configure: string;
    aria: string;
    privacy: string;
    terms: string;
    cookies: string;
    privacyHref: string;
    termsHref: string;
    cookiesHref: string;
    prefsTitle: string;
    prefsNecessary: string;
    prefsAnalytics: string;
    prefsSave: string;
    prefsCancel: string;
  }
> = {
  es: {
    title: 'Cookies y analiticas',
    body: 'Usamos cookies tecnicas y analiticas (PostHog) para mejorar OmniMon. Tu decision se guarda por 365 dias. No vendemos tus datos.',
    accept: 'Aceptar todas',
    reject: 'Solo esenciales',
    configure: 'Configurar',
    aria: 'Aviso de cookies',
    privacy: 'Politica de privacidad',
    terms: 'Terminos',
    cookies: 'Politica de cookies',
    privacyHref: '/es/privacy',
    termsHref: '/es/terms',
    cookiesHref: '/es/cookies',
    prefsTitle: 'Preferencias de cookies',
    prefsNecessary: 'Esenciales: siempre activas. Guardan tu eleccion, tema e idioma en este navegador.',
    prefsAnalytics: 'Analitica (PostHog): mide visitas e interacciones. Solo se carga si la activas.',
    prefsSave: 'Guardar eleccion',
    prefsCancel: 'Volver',
  },
  en: {
    title: 'Cookies and analytics',
    body: 'We use technical and analytics cookies (PostHog) to improve OmniMon. Your choice is stored for 365 days. We do not sell your data.',
    accept: 'Accept all',
    reject: 'Essential only',
    configure: 'Configure',
    aria: 'Cookie notice',
    privacy: 'Privacy policy',
    terms: 'Terms',
    cookies: 'Cookie policy',
    privacyHref: '/privacy',
    termsHref: '/terms',
    cookiesHref: '/cookies',
    prefsTitle: 'Cookie preferences',
    prefsNecessary: 'Essentials: always on. They store your choice, theme, and language in this browser.',
    prefsAnalytics: 'Analytics (PostHog): measures visits and interactions. Loads only if you enable it.',
    prefsSave: 'Save choice',
    prefsCancel: 'Back',
  },
};

export function detectLocale(lang: string | null | undefined): ConsentLocale {
  try {
    const normalized = (lang || 'es').toLowerCase();
    if (normalized.indexOf('en') === 0) return 'en';
    return 'es';
  } catch {
    return 'es';
  }
}

export function parseConsent(
  raw: string | null,
  nowMs: number = Date.now(),
  durationMs: number = COOKIE_CONSENT_DURATION_MS,
): ConsentRecord | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<ConsentRecord>;
    const ts = Number(parsed && parsed.timestamp);
    if (!Number.isFinite(ts) || nowMs - ts > durationMs) {
      return null;
    }
    return {
      accepted: parsed.accepted === true,
      timestamp: ts,
      version: Number(parsed.version) || COOKIE_CONSENT_VERSION,
    };
  } catch {
    return null;
  }
}

export function hasAnalyticsConsent(
  raw: string | null,
  nowMs: number = Date.now(),
  durationMs: number = COOKIE_CONSENT_DURATION_MS,
): boolean {
  const consent = parseConsent(raw, nowMs, durationMs);
  return consent !== null && consent.accepted === true;
}

export function buildConsentPayload(
  accepted: boolean,
  nowMs: number = Date.now(),
  version: number = COOKIE_CONSENT_VERSION,
): ConsentRecord {
  return {
    accepted: !!accepted,
    timestamp: nowMs,
    version,
  };
}

export function serializeConsent(record: ConsentRecord): string {
  return JSON.stringify(record);
}

export function resolveBannerStrings(locale: ConsentLocale) {
  return CONSENT_STRINGS[locale] || CONSENT_STRINGS.es;
}

/**
 * Build Content-Security-Policy connect/script hosts for PostHog when a key is present.
 */
export function buildPostHogCspFragments(posthogHost: string | null | undefined): {
  scriptSrcExtra: string;
  connectSrcExtra: string;
} {
  if (!posthogHost) {
    return { scriptSrcExtra: '', connectSrcExtra: '' };
  }
  const assetsHost = posthogHost.replace('.i.posthog.com', '-assets.i.posthog.com');
  return {
    scriptSrcExtra: ` ${assetsHost}`,
    connectSrcExtra: ` ${posthogHost}`,
  };
}
