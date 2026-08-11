// Centralized SEO constants & helpers (reused by layout, robots, sitemap, per-page metadata).
import { locales, defaultLocale } from '@/i18n';

// Production site origin (no trailing slash).
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || 'https://airbagad.com'
).replace(/\/$/, '');

export { locales, defaultLocale };

// Primary business city (home base — used for LocalBusiness / Google Business Profile).
export const CITY = { uk: 'Одеса', ru: 'Одесса', en: 'Odesa' };
export const REGION = { uk: 'Одеська область', ru: 'Одесская область', en: 'Odesa Oblast' };

// Delivery geography: major Ukrainian cities we ship to. Rendered as a visible
// "delivery cities" block and exposed via LocalBusiness `areaServed` — this is the
// legitimate way to gain visibility across cities (NOT hidden keyword stuffing).
export const UA_CITIES = {
  uk: ['Київ', 'Одеса', 'Харків', 'Дніпро', 'Львів', 'Запоріжжя', 'Кривий Ріг', 'Миколаїв', 'Вінниця', 'Полтава', 'Чернігів', 'Черкаси', 'Житомир', 'Суми', 'Хмельницький', 'Чернівці', 'Рівне', 'Івано-Франківськ', 'Тернопіль', 'Луцьк', 'Ужгород', 'Кропивницький'],
  ru: ['Киев', 'Одесса', 'Харьков', 'Днепр', 'Львов', 'Запорожье', 'Кривой Рог', 'Николаев', 'Винница', 'Полтава', 'Чернигов', 'Черкассы', 'Житомир', 'Сумы', 'Хмельницкий', 'Черновцы', 'Ровно', 'Ивано-Франковск', 'Тернополь', 'Луцк', 'Ужгород', 'Кропивницкий'],
  en: ['Kyiv', 'Odesa', 'Kharkiv', 'Dnipro', 'Lviv', 'Zaporizhzhia', 'Kryvyi Rih', 'Mykolaiv', 'Vinnytsia', 'Poltava', 'Chernihiv', 'Cherkasy', 'Zhytomyr', 'Sumy', 'Khmelnytskyi', 'Chernivtsi', 'Rivne', 'Ivano-Frankivsk', 'Ternopil', 'Lutsk', 'Uzhhorod', 'Kropyvnytskyi'],
};

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
 * `robots` metadata for pages that must never reach the index: the personal cabinet,
 * the checkout funnel and the theme's leftover shop variants.
 *
 * Note this is deliberately NOT the same list as `Disallow` in robots.js. A page blocked
 * in robots.txt is never fetched, so Googlebot never sees this tag — pages already in the
 * index need `noindex` first and may only be disallowed once they have dropped out.
 */
export const NOINDEX = { index: false, follow: false };

/**
 * Absolute URL of a page in a given locale.
 *
 * The trailing slash is mandatory: `next.config.js` sets `trailingSlash: true`, so a
 * slash-less URL answers with a 308 redirect. Every place that emits a URL — canonical
 * tags, hreflang alternates, sitemap.xml — must go through this helper, otherwise the
 * sitemap advertises redirects instead of pages (which is exactly what happened before).
 *
 * @param {string} path - path WITHOUT locale prefix, slashes optional (e.g. 'shop', '/product/x').
 * @param {string} locale - target locale.
 */
export function localeUrl(path = '', locale = defaultLocale) {
  const clean = String(path).replace(/^\/+/, '').replace(/\/+$/, '');
  return clean ? `${SITE_URL}/${locale}/${clean}/` : `${SITE_URL}/${locale}/`;
}

/**
 * Build `alternates` for a page's metadata: canonical + hreflang for every locale.
 * @param {string} path - path WITHOUT locale prefix (e.g. 'shop', '/product/x').
 * @param {string} locale - current locale (used for canonical).
 */
export function buildAlternates(path = '', locale = defaultLocale) {
  const languages = {};
  for (const l of locales) {
    languages[l] = localeUrl(path, l);
  }
  // x-default points to the default locale version.
  languages['x-default'] = languages[defaultLocale];
  return {
    canonical: localeUrl(path, locale),
    languages,
  };
}
