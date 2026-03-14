'use client';
import React from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Wrapper from '@/layout/wrapper';
import Header from '@/layout/headers/header';
import Footer from '@/layout/footers/footer';

export default function OrderSuccessPage() {
  const t = useTranslations('OrderSuccess');
  const { locale } = useParams();

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
                    <circle cx="12" cy="12" r="10" fill="#10B981" />
                    <path d="m9 12 2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>

                <div className="mb-3">
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '6px 12px',
                      borderRadius: 999,
                      background: 'rgba(16,185,129,0.12)',
                      color: '#0f8a63',
                      fontWeight: 600,
                      fontSize: 13,
                      letterSpacing: '0.02em',
                    }}
                  >
                    {t('statusBadge', { defaultValue: 'Оплата підтверджена' })}
                  </span>
                </div>

                <h2 className="tp-order-success-title mb-3">
                  {t('title', { defaultValue: 'Заказ успешно оформлен!' })}
                </h2>

                <p className="tp-order-success-desc mb-4">
                  {t('description', {
                    defaultValue: 'Спасибо за ваш заказ! Мы свяжемся с вами в ближайшее время для подтверждения деталей доставки.',
                  })}
                </p>

                <div className="tp-order-success-info mb-4">
                  <p className="mb-2">
                    <strong>{t('nextSteps', { defaultValue: 'Что дальше?' })}</strong>
                  </p>
                  <ul className="list-unstyled">
                    <li>✓ {t('step1', { defaultValue: 'Мы обработаем ваш заказ в течение 1-2 рабочих дней' })}</li>
                    <li>✓ {t('step2', { defaultValue: 'Наш менеджер свяжется с вами для подтверждения' })}</li>
                    <li>✓ {t('step3', { defaultValue: 'Отправим товар в выбранное отделение Новой Почты' })}</li>
                    <li>✓ {t('step4', { defaultValue: 'Уведомим вас о готовности к получению' })}</li>
                  </ul>
                </div>

                <div className="tp-order-success-actions" style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <Link
                    href={`/${locale}/orders`}
                    className="tp-btn tp-btn-2 me-3"
                  >
                    {t('myOrders', { defaultValue: 'Мои заказы' })}
                  </Link>

                  <Link
                    href={`/${locale}/shop`}
                    className="tp-btn me-3"
                  >
                    {t('continueShopping', { defaultValue: 'Продолжить покупки' })}
                  </Link>

                  <Link
                    href={`/${locale}`}
                    className="tp-btn tp-btn-border"
                  >
                    {t('backToHome', { defaultValue: 'На главную' })}
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
