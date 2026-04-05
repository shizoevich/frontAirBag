import Script from 'next/script';
import { Inter } from 'next/font/google';
import './globals.scss';
import './globals.css';
import '../styles/quantity-buttons.css';
import { TELEGRAM_WEBAPP_SRC, TELEGRAM_WEBAPP_SCRIPT_ID } from '@/utils/telegram';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
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
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
