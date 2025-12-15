const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin('./src/i18n.js');

/** @type {import('next').NextConfig} */
const nextConfig = {

  trailingSlash: true,
  sassOptions: {
    // Подавляем предупреждения Sass о устаревших функциях Bootstrap
    quietDeps: true,
    silenceDeprecations: ['color-functions', 'global-builtin', 'import'],
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
