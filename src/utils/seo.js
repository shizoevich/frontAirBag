// Centralized SEO constants & helpers (reused by layout, robots, sitemap, per-page metadata).
import { locales, defaultLocale } from '@/i18n';

// Production site origin (no trailing slash).
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || 'https://airbagad.com'
).replace(/\/$/, '');

export { locales, defaultLocale };

/**
 * Build `alternates` for a page's metadata: canonical + hreflang for every locale.
 * @param {string} path - path WITHOUT locale prefix, leading slash optional (e.g. 'shop', '/product/x').
 * @param {string} locale - current locale (used for canonical).
 */
export function buildAlternates(path = '', locale = defaultLocale) {
  const clean = `/${String(path).replace(/^\/+/, '')}`.replace(/\/$/, '');
  const languages = {};
  for (const l of locales) {
    languages[l] = `${SITE_URL}/${l}${clean === '/' ? '' : clean}`;
  }
  // x-default points to the default locale version.
  languages['x-default'] = languages[defaultLocale];
  return {
    canonical: `${SITE_URL}/${locale}${clean === '/' ? '' : clean}`,
    languages,
  };
}
