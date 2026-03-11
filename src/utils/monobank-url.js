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

const PAGE_URL_KEYS = [
  'pageUrl',
  'page_url',
  'monoUrl',
  'mono_url',
  'invoiceUrl',
  'invoice_url',
  'url',
];

const INVOICE_ID_KEYS = ['invoiceId', 'invoice_id', 'invoice'];

const getInvoiceIdFromSource = (source) => pickValue(source, INVOICE_ID_KEYS);

const normalizeMonobankPageUrl = (rawUrl, source) => {
  if (!rawUrl) return null;

  try {
    const url = new URL(rawUrl);
    const isMonoHost = url.hostname === 'pay.monobank.ua';
    const isApiInvoice = url.pathname.includes('/api/web/invoice/get');

    if (isMonoHost && isApiInvoice) {
      const invoiceId =
        url.searchParams.get('invoiceId') ||
        url.searchParams.get('invoice_id') ||
        getInvoiceIdFromSource(source);

      return invoiceId ? `https://pay.monobank.ua/${invoiceId}` : null;
    }
  } catch {
    // rawUrl might be an invoice id already (not a URL)
  }

  if (typeof rawUrl === 'string' && /^[A-Za-z0-9_-]{8,}$/.test(rawUrl)) {
    return `https://pay.monobank.ua/${rawUrl}`;
  }

  return rawUrl;
};

export const resolveMonobankPageUrl = (response) => {
  const source = mergeSources(response);

  for (const key of PAGE_URL_KEYS) {
    const candidate = pickValue(source, [key]);
    const normalized = normalizeMonobankPageUrl(candidate, source);
    if (normalized) return normalized;
  }

  const fallbackInvoiceId = getInvoiceIdFromSource(source);
  if (fallbackInvoiceId) return `https://pay.monobank.ua/${fallbackInvoiceId}`;

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
