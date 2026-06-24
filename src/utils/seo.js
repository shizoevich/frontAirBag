// Centralized SEO constants & helpers (reused by layout, robots, sitemap, per-page metadata).
import { locales, defaultLocale } from '@/i18n';

// Production site origin (no trailing slash).
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || 'https://airbagad.com'
).replace(/\/$/, '');

export { locales, defaultLocale };

/**
 * API base URL for SERVER-SIDE fetches (generateMetadata, sitemap, RSC).
 *
 * In Docker, the browser-facing `NEXT_PUBLIC_API_BASE_URL` (e.g. http://localhost:8000)
 * is NOT reachable from inside the frontend container — there `localhost` is the
 * container itself. Set `API_BASE_URL_INTERNAL` to the in-network URL
 * (e.g. http://backend:8000/api/v2) so server-side fetches resolve. Falls back to the
 * public URL for local (non-container) dev where they're the same host.
 */
export function getServerApiBase() {
  return (
    process.env.API_BASE_URL_INTERNAL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    ''
  ).replace(/\/$/, '');
}

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
