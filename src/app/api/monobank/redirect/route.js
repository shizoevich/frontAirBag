import { NextResponse } from 'next/server';

function pickFirst(obj, keys) {
  for (const k of keys) {
    const v = obj?.[k];
    if (v !== undefined && v !== null && String(v).length) return v;
  }
  return null;
}

function normalizeResult(payload) {
  const statusRaw = pickFirst(payload, ['status', 'paymentStatus', 'state']);
  const errCode = pickFirst(payload, ['errCode', 'errorCode', 'code']);
  const errText = pickFirst(payload, ['errText', 'errorText', 'message', 'detail']);
  const failureReason = pickFirst(payload, ['failureReason', 'failReason', 'reason']);
  const hasSuccessFlag = ['true', '1', 'yes', 'ok', 'success', 'paid'].includes(
    String(pickFirst(payload, ['success', 'isPaid', 'paid']) || '').toLowerCase()
  );

  const status = statusRaw ? String(statusRaw).toLowerCase() : null;
  const hasFailureSignal =
    (errCode && String(errCode) !== '0') ||
    Boolean(failureReason) ||
    (status && ['failed', 'failure', 'error', 'rejected', 'declined', 'canceled', 'cancelled'].includes(status));

  if (hasFailureSignal) {
    return {
      result: 'failed',
      errCode: errCode ? String(errCode) : null,
      reason: failureReason || errText || null,
    };
  }

  // Some integrations indicate success without `status` field.
  if (hasSuccessFlag) {
    return { result: 'success', errCode: null, reason: null };
  }

  if (status && ['success', 'paid', 'ok', 'approved', 'complete', 'completed'].includes(status)) {
    return { result: 'success', errCode: null, reason: null };
  }

  if (status && ['processing', 'pending', 'created', 'hold', 'in_progress'].includes(status)) {
    return { result: 'pending', errCode: null, reason: null };
  }

  // If there is an invoiceId but status is absent, treat as unknown (safer than “success”).
  return { result: 'unknown', errCode: errCode ? String(errCode) : null, reason: failureReason || errText || null };
}

async function readPayload(req) {
  const ct = req.headers.get('content-type') || '';

  // JSON
  if (ct.includes('application/json')) {
    const json = await req.json().catch(() => ({}));
    return typeof json === 'object' && json ? json : {};
  }

  // x-www-form-urlencoded
  if (ct.includes('application/x-www-form-urlencoded')) {
    const text = await req.text().catch(() => '');
    const params = new URLSearchParams(text);
    return Object.fromEntries(params.entries());
  }

  // multipart/form-data
  if (ct.includes('multipart/form-data')) {
    const fd = await req.formData().catch(() => null);
    if (!fd) return {};
    return Object.fromEntries(fd.entries());
  }

  // fallback
  const text = await req.text().catch(() => '');
  if (!text) return {};
  try {
    const json = JSON.parse(text);
    return typeof json === 'object' && json ? json : { raw: text };
  } catch {
    const params = new URLSearchParams(text);
    const obj = Object.fromEntries(params.entries());
    return Object.keys(obj).length ? obj : { raw: text };
  }
}

export async function POST(req) {
  // Payment providers can POST a form to `redirect_url`.
  // We convert it to a user-facing GET page with a toast + final redirect.
  const { searchParams } = new URL(req.url);
  const locale = searchParams.get('locale') || 'uk';
  const orderId = searchParams.get('order_id') || searchParams.get('orderId') || null;

  const payload = await readPayload(req);
  const invoiceId = pickFirst(payload, ['invoiceId', 'invoice_id', 'invoice']);

  const normalized = normalizeResult(payload);

  const nextUrl = new URL(`/${locale}/payment-redirect`, req.url);
  nextUrl.searchParams.set('result', normalized.result);
  if (orderId) nextUrl.searchParams.set('orderId', String(orderId));
  if (invoiceId) nextUrl.searchParams.set('invoiceId', String(invoiceId));
  if (normalized.errCode) nextUrl.searchParams.set('errCode', normalized.errCode);
  if (normalized.reason) nextUrl.searchParams.set('reason', normalized.reason);

  return NextResponse.redirect(nextUrl, { status: 303 });
}

export async function GET(req) {
  // Some provider flows may redirect with GET params instead of POST.
  // Support both to make the integration robust.
  const { searchParams } = new URL(req.url);
  const locale = searchParams.get('locale') || 'uk';
  const orderId = searchParams.get('order_id') || searchParams.get('orderId') || null;

  const payload = Object.fromEntries(searchParams.entries());
  const invoiceId = pickFirst(payload, ['invoiceId', 'invoice_id', 'invoice']);

  const normalized = normalizeResult(payload);

  const nextUrl = new URL(`/${locale}/payment-redirect`, req.url);
  nextUrl.searchParams.set('result', normalized.result);
  if (orderId) nextUrl.searchParams.set('orderId', String(orderId));
  if (invoiceId) nextUrl.searchParams.set('invoiceId', String(invoiceId));
  if (normalized.errCode) nextUrl.searchParams.set('errCode', normalized.errCode);
  if (normalized.reason) nextUrl.searchParams.set('reason', normalized.reason);

  return NextResponse.redirect(nextUrl, { status: 303 });
}
