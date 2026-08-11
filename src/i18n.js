import {getRequestConfig} from 'next-intl/server';

import {locales, defaultLocale, localePrefix} from './i18n-config';

// Re-exported so existing `@/i18n` imports keep working. The values themselves live in
// `i18n-config.js`, which the Edge middleware can import without pulling in
// `next-intl/server`.
export {locales, defaultLocale, localePrefix};

export default getRequestConfig(async ({locale}) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale)) {
    return {
      locale: 'en',
      messages: (await import(`../messages/en.json`)).default
    };
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default
  };

});
