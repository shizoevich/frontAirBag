import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale, localePrefix } from '@/i18n-config';

// Single source of truth is `src/i18n.js` — hardcoding the locale list here once
// let the sitemap advertise `/ru/…` while the site redirected everyone to `/uk/`.
export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix,
});

export const config = {
  matcher: [
    // Enable a redirect to a matching locale at the root
    '/',

    // Set a cookie to remember the previous locale for
    // all requests that have a locale prefix
    '/(uk|ru|en)/:path*',

    // Enable redirects that add a locale prefix
    // (e.g. `/pathnames` -> `/en/pathnames`)
    // IMPORTANT: exclude Next.js API routes from locale middleware.
    // Otherwise `/api/...` gets rewritten to `/<locale>/api/...` and returns 404.
    '/((?!api|_next|.*\\..*).*)'
  ]
};
