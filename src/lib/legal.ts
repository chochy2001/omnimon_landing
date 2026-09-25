import type { ConsentLocale } from './consent';

export type LegalPage = 'privacy' | 'terms' | 'cookies';

export function legalHref(locale: ConsentLocale, page: LegalPage): string {
  if (locale === 'en') {
    if (page === 'privacy') return '/privacy';
    if (page === 'terms') return '/terms';
    return '/cookies';
  }
  if (page === 'privacy') return '/es/privacy';
  if (page === 'terms') return '/es/terms';
  return '/es/cookies';
}

export function legalLinkLabel(locale: ConsentLocale, page: LegalPage): string {
  if (page === 'privacy') {
    return locale === 'en' ? 'Privacy policy' : 'Politica de privacidad';
  }
  if (page === 'terms') {
    return locale === 'en' ? 'Terms' : 'Terminos';
  }
  return locale === 'en' ? 'Cookie policy' : 'Politica de cookies';
}

export function resolveLegalStrings(locale: ConsentLocale) {
  if (locale === 'en') {
    return {
      privacyTitle: 'Privacy policy',
      termsTitle: 'Terms of use',
      cookiesTitle: 'Cookie policy',
      updated: '2026-09-25',
      privacyBody: [
        'OmniMon is a local desktop monitor. This page covers the public website at omnimon.com.mx. The controller is Jorge Salgado Miranda (Mexico City). Privacy contact: jorgesalgadomiranda@protonmail.com. Source code and issue reports: github.com/chochy2001/omnimon.',
        'This notice follows the Mexican LFPDPPP (Diario Oficial de la Federacion 20/03/2025, in force since 21/03/2025). The competent Mexican authority is the Secretaria Anticorrupcion y Buen Gobierno.',
        'The landing stores strictly necessary data in your browser: your cookie choice (omnimon-cookie-consent, 365 days), theme (omnimon-theme) and language. None of it leaves your device and none of it is used for tracking.',
        'Optional PostHog analytics (pageviews, page-leaves, interaction events) run only after you press Accept all or enable analytics in Configure. PostHog is hosted in the United States and builds a person profile only when a visitor is identified. Essentials only loads no analytics at all.',
        'The desktop app processes process, window, and network telemetry on your machine. Optional AI features send redacted or user-supplied context only when you enable them and provide a provider key. They are not covered by website analytics consent.',
        'We do not sell personal data. Processors: PostHog (US analytics, only with consent) and GitHub (downloads, docs, issue reports when you use them).',
        'You can exercise access, rectification, cancellation, opposition, portability, and limitation rights by emailing the privacy contact above. Replies within 7 calendar days, always within 30.',
        'Consent records expire after 365 days and the banner asks again. Analytics data is retained under PostHog default policies. Material changes to this notice update the date above.',
      ],
      termsBody: [
        'OmniMon is open source under the MIT license. Software is provided as-is, without warranty.',
        'Download installers only from official GitHub Releases. The landing shows the latest published tag (currently v6.6.6) for downloads; version 6.8.0 content is a pre-release preview until a release is cut. Homebrew casks track the last published tag, not an unreleased workspace version.',
        'This site takes no payments. OmniMon is free software; voluntary support goes through GitHub Sponsors under their own terms.',
        'Lua plugins run in an embedded VM with a restricted standard library, memory cap, and time budget. That is not a security sandbox. Only load scripts you trust.',
        'These terms cover the website and distributed binaries. They do not create a hosted SaaS contract or a production Mac fleet SLA. Disputes are governed by the laws of Mexico, courts of Mexico City.',
      ],
      cookiesBody: [
        'omnimon.com.mx sets no tracking cookies by itself. Analytics run only after consent, and you can enable or skip them per visit with Configure. Details also live in the privacy policy.',
        'Strictly necessary browser storage (always on): omnimon-cookie-consent (your choice, timestamp, version; expires after 365 days), omnimon-theme (light/dark), and the language selection. First-party only, never sent to any server.',
        'PostHog analytics (only after consent): measures pageviews, page-leaves, and interaction events from us.i.posthog.com. Sets its own cookies and storage identifiers. Essentials only prevents PostHog from loading.',
        'This site embeds no third-party widgets and loads its fonts first-party. Outbound links (GitHub releases, docs, sponsors) open on their domains under their own cookie policies.',
        'Withdraw consent at any time by clearing this site data in your browser settings; the banner asks again on your next visit. Your stored choice also expires automatically after 365 days.',
      ],
    };
  }

  return {
    privacyTitle: 'Politica de privacidad',
    termsTitle: 'Terminos de uso',
    cookiesTitle: 'Politica de cookies',
    updated: '2026-09-25',
    privacyBody: [
      'OmniMon es un monitor de escritorio local. Esta pagina cubre el sitio publico omnimon.com.mx. El responsable es Jorge Salgado Miranda (Ciudad de Mexico). Contacto de privacidad: jorgesalgadomiranda@protonmail.com. Codigo e incidencias: github.com/chochy2001/omnimon.',
      'Este aviso sigue la LFPDPPP mexicana (Diario Oficial de la Federacion 20/03/2025, vigente desde el 21/03/2025). La autoridad mexicana competente es la Secretaria Anticorrupcion y Buen Gobierno.',
      'La landing guarda datos estrictamente necesarios en tu navegador: tu eleccion de cookies (omnimon-cookie-consent, 365 dias), tema (omnimon-theme) e idioma. Nada sale de tu dispositivo ni se usa para rastreo.',
      'La analitica opcional de PostHog (vistas de pagina, salidas de pagina, eventos de interaccion) solo se ejecuta si presionas Aceptar todas o activas analitica en Configurar. PostHog esta alojado en Estados Unidos y crea un perfil de persona solo cuando un visitante se identifica. Solo esenciales no carga ninguna analitica.',
      'La app de escritorio procesa telemetria de procesos, ventanas y red en tu equipo. Las funciones de IA opcionales envian contexto solo si las activas y das una clave de proveedor. No dependen del consentimiento analitico del sitio.',
      'No vendemos datos personales. Encargados: PostHog (analitica en EE. UU., solo con consentimiento) y GitHub (descargas, documentacion e incidencias cuando los usas).',
      'Puedes ejercer derechos de acceso, rectificacion, cancelacion, oposicion, portabilidad y limitacion escribiendo al contacto de arriba. Respuesta en menos de 7 dias naturales, siempre dentro de 30.',
      'Los registros de consentimiento vencen a los 365 dias y el banner vuelve a preguntar. La analitica se conserva segun las politicas por defecto de PostHog. Cambios materiales a este aviso actualizan la fecha de arriba.',
    ],
    termsBody: [
      'OmniMon es codigo abierto bajo licencia MIT. El software se ofrece tal cual, sin garantia.',
      'Descarga instaladores solo desde GitHub Releases oficiales. La landing muestra el ultimo tag publicado (actualmente v6.6.6) para descargas; el contenido de la version 6.8.0 es una vista previa pre-release hasta que se corte el release. La formula de Homebrew sigue el ultimo tag publicado, no una version de workspace sin publicar.',
      'Este sitio no cobra. OmniMon es software gratuito; el apoyo voluntario va por GitHub Sponsors bajo sus propios terminos.',
      'Los plugins Lua corren en una VM embebida con stdlib restringida, tope de memoria y presupuesto de tiempo. Eso no es un sandbox de seguridad. Carga solo scripts en los que confies.',
      'Estos terminos cubren el sitio y los binarios distribuidos. No crean un contrato SaaS ni un SLA de flota Mac en produccion. Disputas bajo las leyes de Mexico, tribunales de la Ciudad de Mexico.',
    ],
    cookiesBody: [
      'omnimon.com.mx no coloca cookies de rastreo por si mismo. La analitica solo se ejecuta con consentimiento, y puedes activarla u omitirla con Configurar. El detalle tambien esta en la politica de privacidad.',
      'Almacenamiento estrictamente necesario (siempre activo): omnimon-cookie-consent (tu eleccion, marca de tiempo, version; vence a los 365 dias), omnimon-theme (claro/oscuro) y el idioma. Solo propio, nunca se envia a ningun servidor.',
      'Analitica de PostHog (solo con consentimiento): mide vistas de pagina, salidas de pagina y eventos de interaccion desde us.i.posthog.com. Coloca sus propias cookies e identificadores. Solo esenciales evita que PostHog se cargue.',
      'Este sitio no incrusta widgets de terceros y sirve sus fuentes en propio. Los enlaces externos (releases, docs y sponsors en GitHub) abren en sus dominios bajo sus propias politicas de cookies.',
      'Retira el consentimiento cuando quieras borrando los datos de este sitio en tu navegador; el banner vuelve a preguntar en tu proxima visita. Tu eleccion guardada tambien vence automaticamente a los 365 dias.',
    ],
  };
}
