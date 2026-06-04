'use client';
import React from "react";
import Link from "next/link";
import useCartInfo from "@/hooks/use-cart-info";
import { useState } from "react";
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { useGetPaymentConfigQuery } from '@/redux/features/paymentsApi';

const CartCheckout = () => {
  const {total} = useCartInfo();
  const [shipCost,setShipCost] = useState(0);
  const t = useTranslations('Cart');
  const tPay = useTranslations('Payments');
  const { locale } = useParams();
  const { data: paymentConfig } = useGetPaymentConfigQuery();
  const isTestMode = paymentConfig?.mode === 'test';
  // handle shipping cost 
  const handleShippingCost = (value) => {
    if(value === 'free'){
      setShipCost(0)
    }
    else {
      setShipCost(value)
    }
  }
  return (
    <div className="tp-cart-checkout-wrapper">
      <div className="tp-cart-checkout-top d-flex align-items-center justify-content-between">
        <span className="tp-cart-checkout-top-title">{t('subtotal')}</span>
        <span className="tp-cart-checkout-top-price">{total.toFixed(2)}₴</span>
      </div>
      <div className="tp-cart-checkout-total d-flex align-items-center justify-content-between">
        <span>{t('total')}</span>
        <span>{(total + shipCost).toFixed(2)}₴</span>
      </div>
      <div className="tp-cart-checkout-proceed">
        {isTestMode && (
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: '#92400e',
              background: '#fef3c7',
              border: '1px solid #f59e0b',
              borderRadius: 8,
              padding: '8px 12px',
              marginBottom: 12,
              textAlign: 'center',
            }}
          >
            🧪 {tPay('test_mode_badge')}
          </div>
        )}
        <Link href={`/${locale}/checkout`} className="tp-cart-checkout-btn w-100">
          {t('proceedToCheckout')}
        </Link>
      </div>
    </div>
  );
};

export default CartCheckout;
