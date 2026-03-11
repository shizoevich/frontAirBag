'use client';

import React from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

export default function PaymentRedirectClient() {
  const { locale } = useParams();
  const router = useRouter();
  const sp = useSearchParams();
  const t = useTranslations('Payments');

  const result = (sp.get('result') || 'unknown').toLowerCase();
  const orderId = sp.get('orderId') || sp.get('order_id');
  const invoiceId = sp.get('invoiceId') || sp.get('invoice_id');
  const errCode = sp.get('errCode');
  const reason = sp.get('reason');

  React.useEffect(() => {
    // If we are inside an iframe (checkout modal), notify the parent page.
    // Parent will close the iframe, show localized toast, and route accordingly.
    try {
      if (result === 'success') {
        const key = orderId ? `paymentResult:${orderId}` : 'paymentResult:last';
        localStorage.setItem(
          key,
          JSON.stringify({ result, orderId: orderId ? String(orderId) : null, ts: Date.now() })
        );
      }
      const payload = {
        type: 'monobank-payment-result',
        result,
        orderId: orderId ? String(orderId) : null,
        invoiceId: invoiceId ? String(invoiceId) : null,
        errCode: errCode ? String(errCode) : null,
        reason: reason ? String(reason) : null,
        locale,
      };

      if (typeof window !== 'undefined' && window.parent && window.parent !== window) {
        window.parent.postMessage(payload, window.location.origin);
      }
    } catch {
      // ignore
    }
  }, [errCode, invoiceId, locale, orderId, reason, result]);

  React.useEffect(() => {
    if (result !== 'success') return;
    const target = `/${locale}/orders`;
    const timer = setTimeout(() => {
      try {
        if (typeof window !== 'undefined' && window.parent && window.parent !== window) {
          window.parent.location.assign(target);
          return;
        }
      } catch {
        // ignore and fallback to client navigation
      }
      router.push(target);
    }, 300);
    return () => clearTimeout(timer);
  }, [locale, result, router]);

  // Fallback UI (if opened in a new tab, or postMessage is blocked)
  return (
    <div className="container" style={{ padding: '40px 0' }}>
      <h1 style={{ fontSize: 22, marginBottom: 12 }}>{t('processing_title')}</h1>
      <p style={{ marginBottom: 0 }}>{t('processing_description')}</p>
    </div>
  );
}
