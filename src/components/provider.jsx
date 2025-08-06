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
          <Toaster />
        </AppProvider>
      </NextIntlClientProvider>
    </ReduxProvider>
  );
}