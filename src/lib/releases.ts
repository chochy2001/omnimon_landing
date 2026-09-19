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
