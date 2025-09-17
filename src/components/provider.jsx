'use client';

import React from 'react';
import { ReduxProvider } from '@/redux/provider';
import { AppProvider } from '@/context/app-context';
import { NextIntlClientProvider } from 'next-intl';
import { Toaster } from 'react-hot-toast';

// This component centralizes all client-side providers
export default function Providers({ children, locale, messages }) {
  return (
    <ReduxProvider>
      <NextIntlClientProvider locale={locale} messages={messages}>
        <AppProvider>
          {children}
          <Toaster 
            position="top-right"
            reverseOrder={false}
            gutter={8}
            containerClassName=""
            containerStyle={{
              top: 20,
              right: 20,
              zIndex: 9999,
            }}
            toastOptions={{
              // Default options for all toasts
              duration: 4000,
              style: {
                fontSize: '14px',
                fontWeight: '500',
                padding: '12px 16px',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                maxWidth: '400px',
              },
              // Success toast styling
              success: {
                style: {
                  background: '#10B981',
                  color: '#fff',
                },
                iconTheme: {
                  primary: '#fff',
                  secondary: '#10B981',
                },
              },
              // Error toast styling
              error: {
                duration: 5000,
                style: {
                  background: '#EF4444',
                  color: '#fff',
                },
                iconTheme: {
                  primary: '#fff',
                  secondary: '#EF4444',
                },
              },
            }}
          />
        </AppProvider>
      </NextIntlClientProvider>
    </ReduxProvider>
  );
}