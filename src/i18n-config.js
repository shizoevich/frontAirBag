// Locale configuration — the single source of truth for the whole app.
//
// Kept free of any imports on purpose: `middleware.js` runs on the Edge runtime and
// must not pull in `next-intl/server` (which `i18n.js` needs). Everything that only
// wants the locale list imports from here; `i18n.js` re-exports these values so the
// existing `@/i18n` imports keep working.

export const locales = ['en', 'ru', 'uk'];

// Main locale of the business. Drives the middleware redirect from `/`, the canonical
// `<loc>` entries in sitemap.xml and the `x-default` hreflang target — these MUST agree,
// otherwise Google indexes one locale while the site serves another.
export const defaultLocale = 'uk';

export const localePrefix = 'always'; // 'always' | 'as-needed' | 'never'
