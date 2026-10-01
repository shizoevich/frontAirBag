'use client';
import React from 'react';
import { useTranslations } from 'next-intl';

// Ряд значков способов оплаты, доступных на внешней странице Monobank.
// Показывается под кнопкой mono Pay, чтобы пользователи без Monobank
// понимали, что оплатить можно Apple Pay, Google Pay или любой картой.
const PaymentMethodsHint = () => {
  const t = useTranslations('Checkout');

  return (
    <div className="payment-methods-hint">
      <div className="payment-methods-hint__badges">
        {/* Apple Pay */}
        <span className="payment-methods-hint__badge" aria-label="Apple Pay">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
          </svg>
          <span className="payment-methods-hint__badge-text">Pay</span>
        </span>

        {/* Google Pay */}
        <span className="payment-methods-hint__badge" aria-label="Google Pay">
          <svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z" />
            <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z" />
            <path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z" />
            <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z" />
          </svg>
          <span className="payment-methods-hint__badge-text">Pay</span>
        </span>

        {/* Банковская карта */}
        <span className="payment-methods-hint__badge" aria-label={t('payment_card_badge')}>
          <svg width="18" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <rect x="2" y="5" width="20" height="14" rx="2.5" />
            <line x1="2" y1="10" x2="22" y2="10" strokeWidth="2.4" />
            <line x1="5.5" y1="15" x2="10.5" y2="15" />
          </svg>
          <span className="payment-methods-hint__badge-text">{t('payment_card_badge')}</span>
        </span>

        {/* mono */}
        <span className="payment-methods-hint__badge payment-methods-hint__badge--mono" aria-label="Monobank">
          mono
        </span>
      </div>
      <p className="payment-methods-hint__text">{t('payment_methods_hint')}</p>
    </div>
  );
};

export default PaymentMethodsHint;
