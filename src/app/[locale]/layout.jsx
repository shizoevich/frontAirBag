import Script from 'next/script';
import { Jost, Roboto, Charm, Oregano } from 'next/font/google';
import { notFound } from 'next/navigation';
import Providers from '@/components/provider';
import { defaultLocale } from '@/i18n';
import { SITE_URL } from '@/utils/seo';
import { TELEGRAM_WEBAPP_SRC, TELEGRAM_WEBAPP_SCRIPT_ID } from '@/utils/telegram';
// NOTE: global styles are imported once in [`RootLayout`](src/app/layout.jsx:1)

// Font definitions
const body = Jost({
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  variable: "--tp-ff-body",
});
const heading = Jost({
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  variable: "--tp-ff-heading",
});
const p = Jost({
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  variable: "--tp-ff-p",
});
const jost = Jost({
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  variable: "--tp-ff-jost",
});
const roboto = Roboto({
  weight: ["300", "400", "500", "700", "900"],
  subsets: ["latin"],
  variable: "--tp-ff-roboto",
});
const oregano = Oregano({
  weight: ["400"],
  subsets: ["latin"],
  variable: "--tp-ff-oregano",
});
const charm = Charm({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--tp-ff-charm",
});

// Metadata определяется в generateMetadata

// Function to get messages
async function getMessages(locale) {
  try {
    return (await import(`../../../messages/${locale}.json`)).default;
  } catch (error) {
    notFound();
  }
}

// Generate static params for locales
export async function generateStaticParams() {
  return ['en', 'ru', 'uk'].map((locale) => ({ locale }));
}

// Generate viewport for the page
export function generateViewport() {
  return {
    width: 'device-width',
    initialScale: 1.0,
    maximumScale: 1.0,
    userScalable: false,
  };
}

// Generate metadata for the page
export async function generateMetadata({ params }) {
  const { locale } = (await params) || {};
  const lang = locale || defaultLocale;

  const title =
    lang === 'uk'
      ? 'AirbagAD — подушки безпеки, ремені, піропатрони | Дніпро, Україна'
      : lang === 'en'
      ? 'AirbagAD — airbags, seat belts, pyrotechnics | Dnipro, Ukraine'
      : 'AirbagAD — подушки безопасности, ремни, пиропатроны | Днепр, Украина';

  const description =
    lang === 'uk'
      ? 'AirbagAD (Airbag Auto Delivery) — продаж і доставка подушок безпеки, ременів безпеки, піропатронів, пульок та парашутів по Дніпру та всій Україні.'
      : lang === 'en'
      ? 'AirbagAD (Airbag Auto Delivery) — sale and delivery of airbags, seat belts, pyrotechnics (squibs) and airbag bags across Dnipro and Ukraine.'
      : 'AirbagAD (Airbag Auto Delivery) — продажа и доставка подушек безопасности, ремней безопасности, пиропатронов, пулек и парашютов по Днепру и всей Украине.';

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: title,
      template: '%s | AirbagAD',
    },
    description,
    applicationName: 'AirbagAD',
    keywords: [
      'airbag',
      'airbagAD',
      'airbag auto delivery',
      'подушки безопасности',
      'подушки безпеки',
      'ремни безопасности',
      'пиропатроны',
      'пульки',
      'парашюты',
      'airbag Днепр',
      'Дніпро',
      'Украина',
    ],
    icons: {
      icon: [
        { url: '/favicon.ico', sizes: 'any' },
        { url: '/assets/img/logo/favicon.png', type: 'image/png' },
      ],
      shortcut: '/favicon.ico',
      apple: '/assets/img/logo/favicon.png',
      other: {
        rel: 'apple-touch-icon-precomposed',
        url: '/assets/img/logo/favicon.png',
      },
    },
    openGraph: {
      type: 'website',
      siteName: 'AirbagAD',
      title,
      description,
      url: `${SITE_URL}/${lang}`,
      locale: lang === 'uk' ? 'uk_UA' : lang === 'en' ? 'en_US' : 'ru_RU',
      images: [
        {
          url: '/assets/img/logo/auto-delivery-logo.jpg',
          width: 1200,
          height: 630,
          alt: 'AirbagAD',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/assets/img/logo/auto-delivery-logo.jpg'],
    },
  };
}

// Organization + LocalBusiness JSON-LD (strengthens local search & Google Business Profile link).
const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'AutoPartsStore',
  '@id': `${SITE_URL}/#organization`,
  name: 'AirbagAD',
  alternateName: ['Airbag Auto Delivery', 'AirBag AD'],
  url: SITE_URL,
  logo: `${SITE_URL}/assets/img/logo/auto-delivery-logo-nobg.png`,
  image: `${SITE_URL}/assets/img/logo/auto-delivery-logo.jpg`,
  description:
    'Подушки безопасности, ремни безопасности, пиропатроны, пульки и парашюты. Продажа и доставка по Днепру и всей Украине.',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Днепр',
    addressRegion: 'Дніпропетровська область',
    addressCountry: 'UA',
  },
  areaServed: 'UA',
};

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  url: SITE_URL,
  name: 'AirbagAD',
  inLanguage: ['uk', 'ru'],
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${SITE_URL}/uk/search?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
};

// Root Layout Component
export default async function RootLayout({ children, params }) {
  // Получаем текущую локаль из params (с await)
  const { locale } = await params || {};
  const lang = locale || defaultLocale;
  const messages = await getMessages(lang);

  return (
    <html lang={lang} suppressHydrationWarning={true}>
      <body className={`${body.variable} ${heading.variable} ${p.variable} ${jost.variable} ${roboto.variable} ${oregano.variable} ${charm.variable}`} suppressHydrationWarning={true}>
        <Script src={TELEGRAM_WEBAPP_SRC} strategy="afterInteractive" id={TELEGRAM_WEBAPP_SCRIPT_ID} />
        <Script
          id="telegram-webapp-bootstrap"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(() => {
              const markLoaded = () => {
                if (typeof window === 'undefined') return;
                if (window.__telegramScriptLoaded) return;
                if (window.Telegram?.WebApp) {
                  window.__telegramScriptLoaded = true;
                  window.dispatchEvent(new Event('telegram-webapp-loaded'));
                }
              };
              if (document.readyState === 'complete') {
                markLoaded();
              } else {
                window.addEventListener('load', markLoaded, { once: true });
              }
              const interval = setInterval(() => {
                markLoaded();
                if (window.__telegramScriptLoaded) clearInterval(interval);
              }, 500);
            })();`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <Providers locale={lang} messages={messages}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
