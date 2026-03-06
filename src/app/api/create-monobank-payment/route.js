import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

function resolvePageUrl(data) {
  return (
    data?.pageUrl ||
    data?.page_url ||
    data?.monoUrl ||
    data?.mono_url ||
    data?.invoiceUrl ||
    data?.invoice_url ||
    data?.url ||
    data?.data?.pageUrl ||
    data?.data?.page_url ||
    data?.data?.monoUrl ||
    data?.data?.mono_url ||
    data?.data?.invoiceUrl ||
    data?.data?.invoice_url ||
    data?.data?.url ||
    null
  );
}

export async function POST(req) {
  try {
    if (!API_BASE_URL) {
      return NextResponse.json(
        { error: 'NEXT_PUBLIC_API_BASE_URL is not configured' },
        { status: 500 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const amount = Number(body?.amount);
    const order_id = body?.order_id;
    const redirect_url =
      body?.redirect_url ||
      body?.redirectUrl ||
      // Safe fallback if not provided by the client
      'https://example.com';

    // Prefer the swagger-backed contract when order_id is available.
    // Fallback to {amount, redirect_url} if backend supports it.
    const payload = order_id
      ? { order_id, redirect_url }
      : { amount, redirect_url };

    const auth = req.headers.get('authorization');

    const res = await fetch(`${API_BASE_URL}/payments/create/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(auth ? { Authorization: auth } : {}),
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
    });

    const rawText = await res.text();
    let data;
    try {
      data = rawText ? JSON.parse(rawText) : null;
    } catch {
      data = { raw: rawText };
    }

    if (!res.ok) {
      return NextResponse.json(
        {
          error: 'Monobank payment create failed',
          status: res.status,
          data,
        },
        { status: res.status }
      );
    }

    const pageUrl = resolvePageUrl(data);
    if (!pageUrl) {
      return NextResponse.json(
        { error: 'Payment created but pageUrl is missing', data },
        { status: 502 }
      );
    }

    return NextResponse.json({ pageUrl, raw: data });
  } catch (err) {
    return NextResponse.json(
      { error: 'Unexpected error', message: err?.message || String(err) },
      { status: 500 }
    );
  }
}
