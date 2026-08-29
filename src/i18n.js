import {getRequestConfig} from 'next-intl/server';

import {locales, defaultLocale, localePrefix} from './i18n-config';

// Re-exported so existing `@/i18n` imports keep working. The values themselves live in
// `i18n-config.js`, which the Edge middleware can import without pulling in
// `next-intl/server`.
export {locales, defaultLocale, localePrefix};

// next-intl 4 передаёт сюда `requestLocale` (промис), а не `locale`: старая сигнатура
// `({locale})` молча давала `undefined`, проверка не проходила, и КАЖДЫЙ серверный
// компонент с `useTranslations` рендерился по-английски независимо от языка URL
// (клиентские не страдали — им сообщения кладёт `NextIntlClientProvider` в layout).
export default getRequestConfig(async ({requestLocale}) => {
  const requested = await requestLocale;
  const locale = locales.includes(requested) ? requested : defaultLocale;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default
  };
});
