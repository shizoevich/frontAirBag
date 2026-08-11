import Link from "next/link";
import { defaultLocale } from "@/i18n-config";
import messages from "../../messages/uk.json";

// Root-level 404.
//
// Why it lives here and not under `[locale]/`, and why it renders its own <html>/<body>:
//
//   * `app/layout.jsx` is a pass-through (the real shell with <html lang> lives in
//     `[locale]/layout.jsx`, the next-intl pattern). A not-found page rendered outside
//     that locale layout therefore has no document shell, and Next replaces the whole
//     response with its built-in error screen — `<html id="__next_error__">` with zero
//     links. That is exactly what visitors used to get.
//   * A `not-found` file marked `'use client'` is ignored by Next altogether. The previous
//     `[locale]/not-found.jsx` started with `'use client'`, which is why it never rendered
//     once since it was written.
//
// Verified: this file handles addresses that match no route (e.g. /uk/anything).
// Addresses where a page calls `notFound()` explicitly — a removed product or category —
// still fall back to the built-in screen; that case needs the layout structure reworked
// and is tracked separately.
//
// Texts are taken from the default-locale message file directly: this component renders
// outside the locale segment, so `getTranslations()` has no request locale to work with.

const t = messages.NotFound;
const L = (path) => `/${defaultLocale}${path}`;

export default function RootNotFound() {
  return (
    <html lang={defaultLocale}>
      <body>
        <main
          style={{
            minHeight: '70vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
            textAlign: 'center',
          }}
        >
          <div style={{ maxWidth: '32rem' }}>
            <h1 style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>{t.title}</h1>
            <p style={{ color: '#555', lineHeight: 1.6, marginBottom: '1.5rem' }}>{t.text}</p>

            <p>
              <Link
                href={L('/shop/')}
                style={{
                  display: 'inline-block',
                  padding: '0.7rem 1.4rem',
                  background: '#0989FF',
                  color: '#fff',
                  borderRadius: '4px',
                  textDecoration: 'none',
                }}
              >
                {t.to_shop}
              </Link>
            </p>

            <p style={{ marginTop: '1.25rem', color: '#555' }}>
              <Link href={L('/')}>{t.to_home}</Link>
              <span style={{ margin: '0 0.5rem' }}>·</span>
              <Link href={L('/car-brands/')}>{t.to_brands}</Link>
              <span style={{ margin: '0 0.5rem' }}>·</span>
              <Link href={L('/contact/')}>{t.to_contact}</Link>
            </p>
          </div>
        </main>
      </body>
    </html>
  );
}
