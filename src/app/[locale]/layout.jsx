import { Jost, Roboto, Charm, Oregano } from 'next/font/google';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import Providers from '@/components/provider';
import '../globals.scss';

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

// Metadata
export const metadata = {
  title: 'Shofy - E-commerce',
  description: 'Shofy - E-commerce Template by ThemePure',
};

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

// Root Layout Component
export default async function RootLayout({ children, params }) {
  const locale = params.locale;
  const messages = await getMessages(locale);

  return (
    <html lang={locale} suppressHydrationWarning={true}>
      <body className={`${body.variable} ${heading.variable} ${p.variable} ${jost.variable} ${roboto.variable} ${oregano.variable} ${charm.variable}`} suppressHydrationWarning={true}>
        <Providers locale={locale} messages={messages}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
