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
  title: `OmniMon v${OMNIMON_VERSION}: Memory Guard for macOS`,
  date: RELEASE_DATE,
  summary:
    'Optional LaunchAgent that reaps idle leftover processes without touching Warp, Chrome, agent sessions, or Apple fseventsd. Complements the in-app Zombie Killer. Deterministic classifier with a prove table.',
};

export const latestReleasePostEs: BlogPostPreview = {
  slug: buildReleaseSlug(OMNIMON_VERSION, 'es'),
  title: `OmniMon v${OMNIMON_VERSION}: Memory Guard para macOS`,
  date: RELEASE_DATE_ES,
  summary:
    'LaunchAgent opcional que cierra leftovers idle sin tocar Warp, Chrome, sesiones de agentes ni fseventsd de Apple. Complementa el Zombie Killer de la app. Clasificador determinista con tabla prove.',
};

const publishedEnglishPosts: BlogPostPreview[] = [
  latestReleasePost,
  {
    slug: 'v6-7-0-release',
    title: 'OmniMon v6.7.0: Zombie Killer & AI Safety Hardening',
    date: '17 Apr 2026',
    summary:
      'Zombie Killer engine, AI privacy mode, daily AI budget, keyring hardening, a DPI transparency badge, and a network-alerts evaluator refactor.',
  },
  {
    slug: 'v6-6-0-release',
    title: 'OmniMon v6.6.0: Windows Native Tabs & Dev Tooling',
    date: '17 Mar 2026',
    summary:
      'Native Windows browser tab detection via UI Automation, Bun across the toolchain, automated dev scripts, and cross-platform stability fixes.',
  },
  {
    slug: 'v6-5-0-release',
    title: 'OmniMon v6.5.0: Smart Kill & Charts Fix',
    date: '12 Mar 2026',
    summary:
      'Smart kill dialog with browser tab names, AI safety check, dynamic charts, unified theme system, and tabs visible in basic mode.',
  },
  {
    slug: 'v6-4-1-release',
    title: 'OmniMon v6.4.1: Reality Fix Release',
    date: '11 Mar 2026',
    summary:
      'Solid UI colors, Lucide icons, real AI streaming via SSE, full i18n, Pro Mode, and stronger test coverage.',
  },
];

const publishedSpanishPosts: BlogPostPreview[] = [
  latestReleasePostEs,
  {
    slug: 'v6-7-0-release-es',
    title: 'OmniMon v6.7.0: Zombie Killer y Endurecimiento de IA',
    date: '17 Abr 2026',
    summary:
      'Motor Zombie Killer, modo de privacidad de IA, presupuesto diario, endurecimiento del keyring y refactor del evaluador de alertas de red.',
  },
  {
    slug: 'v6-6-0-release-es',
    title: 'OmniMon v6.6.0: Tabs Nativos en Windows y Herramientas de Desarrollo',
    date: '17 Mar 2026',
    summary:
      'Deteccion nativa de pestanas en Windows, integracion Bun, scripts de desarrollo y correcciones multiplataforma.',
  },
  {
    slug: 'v6-5-0-release-es',
    title: 'OmniMon v6.5.0: Kill Inteligente y Graficas Corregidas',
    date: '12 Mar 2026',
    summary:
      'Dialogo de kill inteligente, consulta IA, graficas dinamicas, temas unificados y pestanas visibles en modo basico.',
  },
  {
    slug: 'v6-4-1-release-es',
    title: 'OmniMon v6.4.1: Reality Fix Release',
    date: '11 Mar 2026',
    summary:
      'Colores solidos, iconos Lucide, streaming SSE, i18n completo, Modo Pro y mas cobertura de pruebas.',
  },
];

export function publishedPosts(locale: 'en' | 'es'): BlogPostPreview[] {
  return locale === 'es' ? publishedSpanishPosts : publishedEnglishPosts;
}
