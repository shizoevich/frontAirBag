const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin('./src/i18n.js');

// Must match `defaultLocale` in src/i18n-config.js. Duplicated because next.config.js is
// CommonJS and cannot import the ESM config; a mismatch only sends legacy URLs to a
// different (still valid) locale, so it degrades gracefully.
const DEFAULT_LOCALE = 'uk';

// Paths that existed on the old WooCommerce site, before every route gained a locale
// prefix. They are still in Google's index and still receive traffic, so each one gets a
// permanent redirect instead of the 404 it used to return. Product and category slugs
// carry over unchanged (the trailing number is the same id), so the mapping is mechanical.
const LEGACY_STATIC_PATHS = [
  'shop',
  'about',
  'returns',
  'terms',
  'contact',
  'discounts',
  'privacy-policy',
  'car-brands',
  'pyrotechnics',
  'airbag-components',
  'cart',
];

/** @type {import('next').NextConfig} */
const nextConfig = {

  trailingSlash: true,

  async redirects() {
    return [
      {
        source: '/product/:slug',
        destination: `/${DEFAULT_LOCALE}/product/:slug/`,
        permanent: true,
      },
      {
        source: '/category/:slug',
        destination: `/${DEFAULT_LOCALE}/category/:slug/`,
        permanent: true,
      },
      ...LEGACY_STATIC_PATHS.map((path) => ({
        source: `/${path}`,
        destination: `/${DEFAULT_LOCALE}/${path}/`,
        permanent: true,
      })),
    ];
  },

  sassOptions: {
    // Подавляем предупреждения Sass о устаревших функциях Bootstrap
    quietDeps: true,
    silenceDeprecations: ['color-functions', 'global-builtin', 'import'],
  },
  compiler: {
    // Removes console.* calls from production bundles (except console.error/warn).
    // This reduces JS size and avoids expensive logging at runtime.
    removeConsole: {
      exclude: ['error', 'warn'],
    },
  },
  images: {
    // Отключаем оптимизацию изображений только для статического экспорта
    unoptimized: process.env.STATIC_EXPORT === 'true',
    // Опционально: настройки для форматов и качества
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
    remotePatterns: [
      {
        protocol: "https",
        hostname: 'i.ibb.co',
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: 'res.cloudinary.com',
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: 'lh3.googleusercontent.com',
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: 'storage.roapp.io',
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: 'storage.remonline.app',
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: 't3.ftcdn.net',
        pathname: "**",
      }
    ],
  },
  webpack: (config, { isServer }) => {
    // Исправление проблем с модулями Swiper
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    return config;
  },
  transpilePackages: ['swiper'],
}

module.exports = withNextIntl(nextConfig);
