'use client';
import React from "react";
import Link from "next/link";
import useCartInfo from "@/hooks/use-cart-info";
import { useState } from "react";
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';

const CartCheckout = () => {
  const {total} = useCartInfo();
  const [shipCost,setShipCost] = useState(0);
  const t = useTranslations('Cart');
  const { locale } = useParams();
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
        <Link href={`/${locale}/checkout`} className="tp-cart-checkout-btn w-100">
          {t('proceedToCheckout')}
        </Link>
      </div>
    </div>
  );
};

export default CartCheckout;
