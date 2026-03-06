'use client';

import React from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { notifyError, notifyInfo, notifySuccess } from '@/utils/toast';
import { useDispatch } from 'react-redux';
import { clearCart } from '@/redux/features/cartSlice';

export default function PaymentResultPage() {
  const { locale } = useParams();
  const router = useRouter();
  const sp = useSearchParams();
  const t = useTranslations('Payments');
  const dispatch = useDispatch();

  const result = (sp.get('result') || 'unknown').toLowerCase();
  const orderId = sp.get('orderId');
  const invoiceId = sp.get('invoiceId');
  const errCode = sp.get('errCode');
  const reason = sp.get('reason');

  React.useEffect(() => {
    // Show toast once and then route user.
    if (result === 'success') {
      notifySuccess(t('payment_success'));
      dispatch(clearCart());
      router.replace(`/${locale}`);
      return;
    }

    if (result === 'failed') {
      const msg = reason
        ? t('payment_failed_with_reason', { reason })
        : t('payment_failed');
      notifyError(msg);
      if (orderId) {
        // Keep user on the order page.
        router.replace(`/${locale}/orders`);
      } else {
        router.replace(`/${locale}/orders`);
      }
      return;
    }

    // pending / unknown
    notifyInfo(
      t('payment_status_unknown', {
        // next-intl will ignore unused variables in plain strings
        invoiceId: invoiceId || '',
        errCode: errCode || '',
      })
    );
    router.replace(`/${locale}/orders`);
  }, [dispatch, errCode, invoiceId, locale, orderId, reason, result, router, t]);

  // Minimal UI in case routing is blocked
  return (
    <div className="container" style={{ padding: '40px 0' }}>
      <h1 style={{ fontSize: 22, marginBottom: 12 }}>{t('processing_title')}</h1>
      <p style={{ marginBottom: 0 }}>{t('processing_description')}</p>
    </div>
  );
}

