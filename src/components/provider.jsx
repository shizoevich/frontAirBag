'use client';

import React from 'react';
import { ReduxProvider } from '@/redux/provider';
import { AppProvider } from '@/context/app-context';
import { NextIntlClientProvider } from 'next-intl';
import { Toaster, ToastBar, toast } from 'react-hot-toast';
import AuthInitializer from '@/components/auth/auth-initializer';

// This component centralizes all client-side providers
export default function Providers({ children, locale, messages }) {
  return (
    <ReduxProvider>
      <NextIntlClientProvider locale={locale} messages={messages} timeZone="Europe/Kyiv">
        <AppProvider>
          <AuthInitializer>
            {children}
          </AuthInitializer>
          <Toaster
            position="top-right"
            reverseOrder={false}
            gutter={8}
            containerStyle={{
              top: 80,  /* below sticky header (~70–80px) */
              right: 20,
              zIndex: 9999,
            }}
            toastOptions={{
              duration: 4000,
              style: {
                fontSize: '14px',
                fontWeight: '500',
                padding: '12px 16px',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                maxWidth: '400px',
              },
              success: {
                style: { background: '#10B981', color: '#fff' },
                iconTheme: { primary: '#fff', secondary: '#10B981' },
              },
              error: {
                duration: 5000,
                style: { background: '#EF4444', color: '#fff' },
                iconTheme: { primary: '#fff', secondary: '#EF4444' },
              },
            }}
          >
            {(t) => (
              <ToastBar toast={t}>
                {({ icon, message }) => (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
                    {icon}
                    <span style={{ flex: 1 }}>{message}</span>
                    <button
                      onClick={() => toast.dismiss(t.id)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '0 4px',
                        color: 'inherit',
                        opacity: 0.7,
                        fontSize: 16,
                        lineHeight: 1,
                        flexShrink: 0,
                      }}
                      aria-label="Закрити"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </ToastBar>
            )}
          </Toaster>
        </AppProvider>
      </NextIntlClientProvider>
    </ReduxProvider>
  );
}