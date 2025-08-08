import {getRequestConfig} from 'next-intl/server';

export const locales = ['en', 'ru', 'uk'];
export const defaultLocale = 'ru';
export const localePrefix = 'always'; // Options: 'always' | 'as-needed' | 'never'

export default getRequestConfig(async ({locale}) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale)) {
    return {
      messages: (await import(`../messages/en.json`)).default
    };
  }

  return {
    messages: (await import(`../messages/${locale}.json`)).default
  };
});
