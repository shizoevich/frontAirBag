import { useLocale } from 'next-intl';

// Hook that returns a guarded getLocalizedLink function
// - Ensures the input is a string
// - Adds the current locale prefix for absolute app paths (starting with '/')
// - Logs a warning with an optional context if a non-string is passed
export function useLocalizedLink() {
  const locale = useLocale();
  return function getLocalizedLink(link, context = 'unknown') {
    try {
      if (typeof link !== 'string') {
        console.warn(`[getLocalizedLink] Non-string link in ${context}:`, link);
        return `/${locale}`;
      }
      if (!link.startsWith('/')) return link; // external or already localized
      return `/${locale}${link}`;
    } catch (e) {
      console.warn(`[getLocalizedLink] Fallback for ${context}:`, e);
      return `/${locale}`;
    }
  };
}
