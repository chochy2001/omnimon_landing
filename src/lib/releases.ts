import { OMNIMON_VERSION, RELEASE_DATE, RELEASE_DATE_ES } from '../consts';

export type BlogPostPreview = {
  slug: string;
  title: string;
  date: string;
  summary: string;
};

export function buildReleaseSlug(version: string, locale: 'en' | 'es' = 'en'): string {
  const suffix = locale === 'es' ? '-es' : '';
  return `v${version.replaceAll('.', '-')}-release${suffix}`;
}

export const latestReleasePost: BlogPostPreview = {
  slug: buildReleaseSlug(OMNIMON_VERSION),
  title: `OmniMon v${OMNIMON_VERSION}: Zombie Killer & AI Safety Hardening`,
  date: RELEASE_DATE,
  summary:
    'Zombie Killer engine for sustained CPU/RAM abusers, AI privacy mode with stable pseudonymous redaction, daily AI budget, keyring delete-first, DPI transparency badge, frontend-confirmed automation tool calls, and a breaking refactor of network-alerts evaluator state.',
};

export const latestReleasePostEs: BlogPostPreview = {
  slug: buildReleaseSlug(OMNIMON_VERSION, 'es'),
  title: `OmniMon v${OMNIMON_VERSION}: Zombie Killer y Endurecimiento de IA`,
  date: RELEASE_DATE_ES,
  summary:
    'Motor Zombie Killer para procesos que abusan de CPU/RAM sostenida, modo de privacidad de IA con redaccion seudonima estable, presupuesto diario de IA, keyring con borrado previo, badge DPI de transparencia, confirmacion frontend de herramientas destructivas y refactor breaking del estado del evaluador de alertas de red.',
};
