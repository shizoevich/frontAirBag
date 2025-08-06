import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale, localePrefix } from './i18n';

export default createMiddleware({
  // A list of all locales that are supported
  locales,

  // Used when no locale matches
  defaultLocale,

  // The prefixing strategy
  localePrefix
});

export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/(ru|en|uk)/:path*']
};
