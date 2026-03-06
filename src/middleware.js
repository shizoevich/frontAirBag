import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  // A list of all locales that are supported
  locales: ['uk', 'ru', 'en'],

  // Used when no locale matches
  defaultLocale: 'uk',

  // Always use a locale prefix
  localePrefix: 'always',
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
