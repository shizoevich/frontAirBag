'use client';

import React from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useGetOrderByIdQuery } from '@/redux/features/ordersApi';

export default function PaymentErrorClient() {
  const { locale } = useParams();
  const sp = useSearchParams();
  const t = useTranslations('Payments');

  const orderId = sp.get('orderId') || sp.get('order_id');
  const queryErrCode = sp.get('errCode') || sp.get('errorCode') || sp.get('code');
  const queryReason = sp.get('reason') || sp.get('failureReason') || sp.get('message');

  const { data: orderData } = useGetOrderByIdQuery(orderId, {
    skip: !orderId,
    refetchOnFocus: true,
  });

  const resolvedCode = orderData?.last_payment_failure_code || queryErrCode || null;
  const resolvedReason = orderData?.last_payment_failure_reason || queryReason || null;

  const resolveLocalizedReason = React.useCallback(() => {
    const code = resolvedCode ? String(resolvedCode) : null;
    if (code) {
      const key = `err_${code}`;
      const hasKey = typeof t?.has === 'function' ? t.has(key) : false;
      if (hasKey) return t(key);
    }

    if (resolvedReason) return t('payment_failed_with_reason', { reason: String(resolvedReason) });
    return t('payment_error_unknown_reason');
  }, [resolvedCode, resolvedReason, t]);

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="tp-order-success text-center py-5">
            <div className="tp-order-success-icon mb-4">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" fill="#EF4444" />
                <path d="M9 9L15 15M15 9L9 15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            <h2 className="tp-order-success-title mb-3">{t('payment_error_title')}</h2>
            <p className="tp-order-success-desc mb-4">{t('payment_error_description')}</p>

            <div className="tp-order-success-info mb-4 text-start mx-auto" style={{ maxWidth: 560 }}>
              {orderId && (
                <p className="mb-2">
                  <strong>{t('payment_error_order_label')}:</strong> #{orderId}
                </p>
              )}

              {resolvedCode && (
                <p className="mb-2">
                  <strong>{t('payment_error_code_label')}:</strong> {resolvedCode}
                </p>
              )}

              <p className="mb-0">
                <strong>{t('payment_error_reason_label')}:</strong> {resolveLocalizedReason()}
              </p>
            </div>

            <div className="tp-order-success-actions">
              <Link href={`/${locale}/orders`} className="tp-btn tp-btn-primary me-3">
                {t('go_to_orders')}
              </Link>

              <Link href={`/${locale}`} className="tp-btn tp-btn-border">
                {t('back_to_home')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

