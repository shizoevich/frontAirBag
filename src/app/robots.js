import { SITE_URL } from '@/utils/seo';

// https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots
export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Private / transactional / non-indexable areas (across all locales).
        //
        // These paths ALSO carry `robots: NOINDEX` in their page metadata (see
        // `utils/seo.js`). Disallow alone is not enough for a page that is already
        // indexed: Googlebot stops fetching it and therefore never sees the noindex,
        // so the URL can linger in search results indefinitely.
        disallow: [
          '/api/',
          '/*/cart',
          '/*/checkout',
          '/*/login',
          '/*/register',
          '/*/order-success',
          '/*/payment-error',
          '/*/payment-redirect',
          '/*/search',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    // No `host` directive: Google ignores it, and Yandex dropped it in 2021. Gluing
    // www to the apex domain is a 301 at the edge (Cloudflare / nginx), not a hint here.
  };
}
