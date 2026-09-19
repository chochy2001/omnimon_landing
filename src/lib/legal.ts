import type { ConsentLocale } from './consent';

export type LegalPage = 'privacy' | 'terms';

export function legalHref(locale: ConsentLocale, page: LegalPage): string {
  if (locale === 'en') {
    return page === 'privacy' ? '/privacy' : '/terms';
  }
  return page === 'privacy' ? '/es/privacy' : '/es/terms';
}

export function legalLinkLabel(locale: ConsentLocale, page: LegalPage): string {
  if (page === 'privacy') {
    return locale === 'en' ? 'Privacy policy' : 'Politica de privacidad';
  }
  return locale === 'en' ? 'Terms' : 'Terminos';
}

export function resolveLegalStrings(locale: ConsentLocale) {
  if (locale === 'en') {
    return {
      privacyTitle: 'Privacy policy',
      termsTitle: 'Terms of use',
      updated: '2026-09-11',
      privacyBody: [
        'OmniMon is a local desktop monitor. This page covers the public website at omnimon.com.mx.',
        'The landing uses technical cookies and optional PostHog analytics only after you accept the cookie banner. The choice is stored in this browser for 365 days. We do not sell personal data.',
        'The desktop app processes process, window, and network telemetry on your machine. Optional AI features send redacted or user-supplied context only when you enable them and provide a provider key. They are not covered by website analytics consent.',
        'Source and issue reports: github.com/chochy2001/omnimon. Manifests may show 6.8.0 while the latest published GitHub tag remains v6.6.6 until a release is cut.',
      ],
      termsBody: [
        'OmniMon is open source under the MIT license. Software is provided as-is, without warranty.',
        'Download installers only from official GitHub Releases. Homebrew casks track the last published tag, not an unreleased workspace version.',
        'Lua plugins run in an embedded VM with a restricted standard library, memory cap, and time budget. That is not a security sandbox. Only load scripts you trust.',
        'These terms cover the website and distributed binaries. They do not create a hosted SaaS contract or a production Mac fleet SLA.',
      ],
    };
  }

  return {
    privacyTitle: 'Politica de privacidad',
    termsTitle: 'Terminos de uso',
    updated: '2026-09-11',
    privacyBody: [
      'OmniMon es un monitor de escritorio local. Esta pagina cubre el sitio publico omnimon.com.mx.',
      'La landing usa cookies tecnicas y analiticas opcionales de PostHog solo si aceptas el aviso de cookies. La decision se guarda 365 dias en este navegador. No vendemos datos personales.',
      'La app de escritorio procesa telemetria de procesos, ventanas y red en tu equipo. Las funciones de IA opcionales envian contexto solo si las activas y das una clave de proveedor. No dependen del consentimiento analitico del sitio.',
      'Codigo e incidencias: github.com/chochy2001/omnimon. Los manifiestos pueden mostrar 6.8.0 mientras el ultimo tag publicado en GitHub siga siendo v6.6.6 hasta que se corte el release.',
    ],
    termsBody: [
      'OmniMon es codigo abierto bajo licencia MIT. El software se ofrece tal cual, sin garantia.',
      'Descarga instaladores solo desde GitHub Releases oficiales. La formula de Homebrew sigue el ultimo tag publicado, no una version de workspace sin publicar.',
      'Los plugins Lua corren en una VM embebida con stdlib restringida, tope de memoria y presupuesto de tiempo. Eso no es un sandbox de seguridad. Carga solo scripts en los que confies.',
      'Estos terminos cubren el sitio y los binarios distribuidos. No crean un contrato SaaS ni un SLA de flota Mac en produccion.',
    ],
  };
}
