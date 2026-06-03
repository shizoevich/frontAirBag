'use client';
import React from "react";
import Image from "next/image";
import { useTranslations } from 'next-intl';
import payment_option_img from '@assets/img/product/icons/payment-option.png';

const DetailsBottomInfo = () => {
  const t = useTranslations('ProductDetails');
  return (
    <>
      {/* product-details-msg */}

      <div className="tp-product-details-msg mb-15">
        <ul>
          <li>{t('easyReturns')}</li>
          <li>{t('sameDayDispatch')}</li>
        </ul>
      </div>
    </>
  );
};

export default DetailsBottomInfo;
