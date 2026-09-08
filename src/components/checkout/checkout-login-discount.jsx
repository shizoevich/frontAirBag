'use client';
import React from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';

// Аноним видит только «войти / зарегистрироваться»: привязка Telegram — действие
// под аккаунтом, и после входа внутри мини-аппа она происходит сама (ADR-0021).
const CheckoutLoginDiscount = ({ user, accessToken }) => {
  const t = useTranslations('Checkout');
  const locale = useLocale();

  return (
    <div className="tp-checkout-login-form-reveal-wrapper">
      <div className="tp-checkout-login-form-reveal">
        {/* Returning Customer Section */}
        {!accessToken}

        {/* Discount Information Section */}
        <div className="tp-checkout-discount-wrapper">
          <div className="tp-checkout-discount-item">
            <div className="tp-checkout-discount-content">
              {!accessToken ? (
                <div className="tp-checkout-discount-message p-3 bg-light rounded">
                  <div className="d-flex align-items-center mb-2">
                    <i className="fa-solid fa-percentage text-primary me-2"></i>
                    <span className="fw-medium">{t('discount_message')}</span>
                  </div>
                  <div className="tp-checkout-discount-actions d-flex flex-wrap gap-2">
                    <Link href={`/${locale}/login?redirect=/${locale}/checkout`} className="btn btn-sm btn-outline-primary">
                      {t('login_button')}
                    </Link>
                    <Link href={`/${locale}/register?redirect=/${locale}/checkout`} className="btn btn-sm btn-primary">
                      {t('register_button')}
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="tp-checkout-discount-authenticated p-3 bg-success bg-opacity-10 rounded">
                  <div className="d-flex align-items-center">
                    <i className="fa-solid fa-check-circle text-success me-2"></i>
                    <span className="text-success fw-medium">
                      {t('authenticated_discount_message')}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutLoginDiscount;
