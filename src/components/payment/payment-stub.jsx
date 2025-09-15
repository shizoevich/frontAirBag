'use client';
import React, { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const PaymentStub = ({ orderId }) => {
  const t = useTranslations('Checkout');
  const router = useRouter();

  // Автоматическое перенаправление через 5 секунд
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push(`/order-confirmation/${orderId}`);
    }, 5000);

    return () => clearTimeout(timer);
  }, [orderId, router]);

  return (
    <div className="tp-payment-stub-area pt-80 pb-80">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="tp-payment-stub-wrapper text-center">
              <div className="tp-payment-stub-icon mb-4">
                <svg width="100" height="100" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="2" y="4" width="20" height="16" rx="2" fill="#007bff"/>
                  <rect x="2" y="6" width="20" height="4" fill="#0056b3"/>
                  <circle cx="6" cy="14" r="1" fill="white"/>
                  <circle cx="10" cy="14" r="1" fill="white"/>
                  <circle cx="14" cy="14" r="1" fill="white"/>
                  <circle cx="18" cy="14" r="1" fill="white"/>
                </svg>
              </div>
              
              <h2 className="tp-payment-stub-title mb-3">
                Інтеграція з платіжною системою
              </h2>
              
              <p className="tp-payment-stub-description mb-4">
                На даний момент інтеграція з платіжною системою знаходиться в розробці. 
                Ваш заказ #{orderId} буде оброблений як &quot;Оплата при отриманні&quot;.
              </p>
              
              <div className="tp-payment-stub-info mb-4">
                <div className="alert alert-info">
                  <h5>Що далі?</h5>
                  <ul className="list-unstyled mb-0">
                    <li>• Ваш заказ автоматично переведено в режим &quot;Оплата при отриманні&quot;</li>
                    <li>• Ми зв&apos;яжемося з вами для підтвердження заказу</li>
                    <li>• Оплата здійснюється готівкою при отриманні товару</li>
                  </ul>
                </div>
              </div>
              
              <div className="tp-payment-stub-countdown mb-4">
                <p className="text-muted">
                  Автоматичне перенаправлення через <span id="countdown">5</span> секунд...
                </p>
              </div>
              
              <div className="tp-payment-stub-actions">
                <Link 
                  href={`/order-confirmation/${orderId}`}
                  className="tp-btn tp-btn-2 me-3"
                >
                  Перейти до підтвердження заказу
                </Link>
                <Link 
                  href="/shop"
                  className="tp-btn tp-btn-border"
                >
                  Продовжити покупки
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <script dangerouslySetInnerHTML={{
        __html: `
          let countdown = 5;
          const countdownElement = document.getElementById('countdown');
          const timer = setInterval(() => {
            countdown--;
            if (countdownElement) {
              countdownElement.textContent = countdown;
            }
            if (countdown <= 0) {
              clearInterval(timer);
            }
          }, 1000);
        `
      }} />
    </div>
  );
};

export default PaymentStub;
