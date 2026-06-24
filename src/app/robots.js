import { SITE_URL } from '@/utils/seo';

// https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots
export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Private / transactional / non-indexable areas (across all locales).
        disallow: [
          '/api/',
          '/*/cart',
          '/*/checkout',
          '/*/login',
          '/*/register',
          '/*/order-success',
          '/*/payment-error',
          '/*/search',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
