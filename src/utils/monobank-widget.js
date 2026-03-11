'use client';

export { buildMonopayWidgetConfig, resolveMonobankPageUrl } from '@/utils/monobank-url';

const MONOPAY_SCRIPT_ID = 'monopay-script';
const MONOPAY_SCRIPT_SRC = 'https://pay.monobank.ua/mono-pay-button/v1/mono-pay-button.js';

export const loadMonoPayScript = () => {
  if (typeof window === 'undefined') return Promise.resolve(false);
  const existing = document.getElementById(MONOPAY_SCRIPT_ID);
  if (existing) return Promise.resolve(true);

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.id = MONOPAY_SCRIPT_ID;
    script.src = MONOPAY_SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = (error) => reject(error || new Error('Failed to load MonoPay script'));
    document.head.appendChild(script);
  });
};
