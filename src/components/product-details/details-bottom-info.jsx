'use client';
import React from "react";
import Image from "next/image";
import { useTranslations } from 'next-intl';
import payment_option_img from '@assets/img/product/icons/payment-option.png';

const DetailsBottomInfo = () => {
  const t = useTranslations('ProductDetails');
  return (
    <>
      {/*  product-details-social*/}

      <div className="tp-product-details-social">
        <span>{t('shareLabel')}</span>
        <a href="#">
          <i className="fa-brands fa-facebook-f"></i>
        </a>
        <a href="#">
          <i className="fa-brands fa-twitter"></i>
        </a>
        <a href="#">
          <i className="fa-brands fa-linkedin-in"></i>
        </a>
        <a href="#">
          <i className="fa-brands fa-vimeo-v"></i>
        </a>
      </div>

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
