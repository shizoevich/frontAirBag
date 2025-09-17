import React from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function OrderSuccessPage() {
  const t = useTranslations('OrderSuccess');
  const { locale } = useParams();

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="tp-order-success text-center py-5">
            <div className="tp-order-success-icon mb-4">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" fill="#10B981"/>
                <path d="m9 12 2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            
            <h2 className="tp-order-success-title mb-3">
              {t('title', { defaultValue: 'Заказ успешно оформлен!' })}
            </h2>
            
            <p className="tp-order-success-desc mb-4">
              {t('description', { 
                defaultValue: 'Спасибо за ваш заказ! Мы свяжемся с вами в ближайшее время для подтверждения деталей доставки.' 
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
            
            <div className="tp-order-success-actions">
              <Link 
                href={`/${locale}/shop`} 
                className="tp-btn tp-btn-primary me-3"
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
  );
}
