'use client';
import React from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

const CheckoutLoginDiscount = ({ user, accessToken }) => {
  const t = useTranslations('Checkout');

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
                  <div className="tp-checkout-discount-actions">
                    <Link href="/login" className="btn btn-sm btn-outline-primary me-2">
                      Увійти
                    </Link>
                    <Link href="/register" className="btn btn-sm btn-primary">
                      Зареєструватися
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="tp-checkout-discount-authenticated p-3 bg-success bg-opacity-10 rounded">
                  <div className="d-flex align-items-center">
                    <i className="fa-solid fa-check-circle text-success me-2"></i>
                    <span className="text-success fw-medium">
                      Ви авторизовані! Ваші знижки будуть автоматично застосовані.
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
