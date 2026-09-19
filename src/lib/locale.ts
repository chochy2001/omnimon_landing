import type { ConsentLocale } from './consent';

export type ChromeCopy = {
  blog: string;
  docs: string;
  github: string;
  download: string;
  theme: string;
  menu: string;
  closeMenu: string;
  langEn: string;
  langEs: string;
  langGroup: string;
  footerHome: string;
  footerReleases: string;
  footerSponsor: string;
  footerCopy: string;
};

export const chromeCopy: Record<ConsentLocale, ChromeCopy> = {
  en: {
    blog: 'Blog',
    docs: 'Docs',
    github: 'GitHub',
    download: 'Download',
    theme: 'Toggle color theme',
    menu: 'Open menu',
    closeMenu: 'Close menu',
    langEn: 'EN',
    langEs: 'ES',
    langGroup: 'Language',
    footerHome: 'Home',
    footerReleases: 'Releases',
    footerSponsor: 'Sponsor',
    footerCopy: 'OmniMon. Open source under MIT.',
  },
  es: {
    blog: 'Blog',
    docs: 'Docs',
    github: 'GitHub',
    download: 'Descargar',
    theme: 'Cambiar tema de color',
    menu: 'Abrir menu',
    closeMenu: 'Cerrar menu',
    langEn: 'EN',
    langEs: 'ES',
    langGroup: 'Idioma',
    footerHome: 'Inicio',
    footerReleases: 'Releases',
    footerSponsor: 'Patrocinar',
    footerCopy: 'OmniMon. Open source bajo MIT.',
  },
};

function normalizePath(pathname: string): string {
  if (!pathname) return '/';
  const withSlash = pathname.startsWith('/') ? pathname : `/${pathname}`;
  if (withSlash.length > 1 && withSlash.endsWith('/')) return withSlash;
  if (withSlash === '/') return '/';
  return `${withSlash}/`;
}

export function localeFromPath(pathname: string): ConsentLocale {
  const p = normalizePath(pathname);
  if (p === '/es/' || p.startsWith('/es/')) return 'es';
  return 'en';
}

export function homeHref(locale: ConsentLocale): string {
  return locale === 'es' ? '/es/' : '/';
}

export function blogHref(locale: ConsentLocale): string {
  return locale === 'es' ? '/es/blog/' : '/blog/';
}

export function switchLocalePath(pathname: string, from: ConsentLocale): string {
  const p = normalizePath(pathname);

  if (from === 'es') {
    if (p === '/es/') return '/';
    if (p.startsWith('/es/privacy')) return '/privacy/';
    if (p.startsWith('/es/terms')) return '/terms/';
    if (p === '/es/blog/') return '/blog/';
    if (p.startsWith('/es/blog/')) {
      const slug = p.slice('/es/blog/'.length).replace(/\/$/, '').replace(/-es$/, '');
      return slug ? `/blog/${slug}/` : '/blog/';
    }
    return '/';
  }

  if (p === '/') return '/es/';
  if (p.startsWith('/privacy')) return '/es/privacy/';
  if (p.startsWith('/terms')) return '/es/terms/';
  if (p === '/blog/') return '/es/blog/';
  if (p.startsWith('/blog/')) {
    const slug = p.slice('/blog/'.length).replace(/\/$/, '');
    return slug ? `/es/blog/${slug}-es/` : '/es/blog/';
  }
  return '/es/';
}
