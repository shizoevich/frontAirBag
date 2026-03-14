'use client';

import React from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useGetOrderByIdQuery } from '@/redux/features/ordersApi';
import Wrapper from '@/layout/wrapper';
import Header from '@/layout/headers/header';
import Footer from '@/layout/footers/footer';

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
    const code = resolvedCode ? String(resolvedCode).trim() : null;
    const reason = resolvedReason ? String(resolvedReason).trim() : null;

    if (code) {
      const key = `err_${code}`;
      const hasKey = typeof t?.has === 'function' ? t.has(key) : false;
      if (hasKey) return t(key);
    }

    if (reason) {
      const source = reason.toLowerCase();
      const reasonMatchers = [
        { key: 'err_CARD_BLOCKED', checks: ['card blocked', 'blocked card', 'картка заблок', 'карта заблок'] },
        { key: 'err_EXPIRED_CARD', checks: ['expired card', 'card expired', 'термін дії', 'срок действия'] },
        { key: 'err_INSUFFICIENT_FUNDS', checks: ['insufficient', 'not enough funds', 'недостаточно средств', 'недостатньо коштів'] },
        { key: 'err_CVV', checks: ['cvv', 'cvc', 'security code'] },
        { key: 'err_3DS', checks: ['3ds', '3-d secure', 'securecode', 'authentication failed'] },
        { key: 'err_LIMIT_EXCEEDED', checks: ['limit exceeded', 'exceeded limit', 'перевищено ліміт', 'превышен лимит'] },
        { key: 'err_DECLINED', checks: ['declined', 'do not honor', 'rejected', 'отклон', 'відхил'] },
        { key: 'err_BANK_UNAVAILABLE', checks: ['issuer unavailable', 'bank unavailable', 'bank error', 'temporarily unavailable', 'тимчасово недоступ', 'временно недоступ'] },
      ];

      const found = reasonMatchers.find((entry) => entry.checks.some((chunk) => source.includes(chunk)));
      if (found) {
        const hasKey = typeof t?.has === 'function' ? t.has(found.key) : false;
        if (hasKey) return t(found.key);
      }

      return t('payment_failed_with_reason', { reason });
    }

    return t('payment_error_unknown_reason');
  }, [resolvedCode, resolvedReason, t]);

  return (
    <Wrapper>
      <Header />
      <main className="main" style={{ background: '#f7f9fc' }}>
        <div className="container" style={{ paddingTop: 36, paddingBottom: 36 }}>
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div
                className="tp-order-success text-center py-5"
                style={{
                  borderRadius: 16,
                  border: '1px solid rgba(0,0,0,0.06)',
                  boxShadow: '0 20px 45px rgba(0,0,0,0.08)',
                  background: '#fff',
                }}
              >
                <div className="mb-4">
                  <img
                    src="/assets/img/logo/auto-delivery-logo-nobg.png"
                    alt="AirBag"
                    style={{ maxWidth: 150, height: 'auto', opacity: 0.95 }}
                  />
                </div>

                <div className="tp-order-success-icon mb-4">
                  <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" fill="#EF4444" />
                    <path d="M9 9L15 15M15 9L9 15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>

                <h2 className="tp-order-success-title mb-3">{t('payment_error_title')}</h2>
                <p className="tp-order-success-desc mb-4">{t('payment_error_description')}</p>

                <div className="d-flex justify-content-center gap-3 mb-4 flex-wrap">
                  <span className="badge bg-light text-dark border">
                    <i className="fas fa-car-crash me-1" /> Системи безпеки авто
                  </span>
                  <span className="badge bg-light text-dark border">
                    <i className="fas fa-tools me-1" /> Допомога з підбором деталей
                  </span>
                  <span className="badge bg-light text-dark border">
                    <i className="fas fa-phone-alt me-1" /> Підтримка менеджера
                  </span>
                </div>

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

                <div className="tp-order-success-actions" style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <Link href={`/${locale}/orders`} className="tp-btn tp-btn-2 me-3">
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
      </main>
      <Footer primary_style={true} />
    </Wrapper>
  );
}
