'use client';

const WIDGET_FIELD_MAP = {
  keyId: ['keyId', 'key_id'],
  signature: ['signature', 'sign', 'hash'],
  requestId: ['requestId', 'request_id', 'requestId_md5'],
  payloadBase64: ['payloadBase64', 'payload_base64', 'payload', 'payloadBase64Encoded'],
};

const mergeSources = (response = {}) => {
  const merge = (source) => (typeof source === 'object' && source ? source : {});
  return {
    ...merge(response),
    ...merge(response.widget),
    ...merge(response.data),
    ...merge(response.raw),
    ...merge(response.raw?.data),
  };
};

const pickValue = (source, keys) => {
  for (const key of keys) {
    const value = source?.[key];
    if (value !== undefined && value !== null) {
      const trimmed = typeof value === 'string' ? value.trim() : value;
      if (trimmed !== '' && trimmed !== null) {
        return String(trimmed);
      }
    }
  }
  return null;
};

export const buildMonopayWidgetConfig = (response) => {
  const source = mergeSources(response);
  const config = {};

  for (const [field, keys] of Object.entries(WIDGET_FIELD_MAP)) {
    const found = pickValue(source, keys);
    if (found) config[field] = found;
  }

  return Object.keys(config).length ? config : null;
};

const PAGE_URL_KEYS = [
  'pageUrl',
  'page_url',
  'monoUrl',
  'mono_url',
  'redirectUrl',
  'redirect_url',
  'invoiceUrl',
  'invoice_url',
  'url',
];

export const resolveMonobankPageUrl = (response) => {
  const source = mergeSources(response);
  return pickValue(source, PAGE_URL_KEYS);
};

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
