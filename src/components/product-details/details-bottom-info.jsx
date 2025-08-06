'use client';
import React from "react";
import Image from "next/image";
import { useTranslations } from 'next-intl';
import payment_option_img from '@assets/img/product/icons/payment-option.png';

const DetailsBottomInfo = ({sku,category,tag}) => {
  const t = useTranslations('ProductDetails');
  return (
    <>
      {/* product-details-query */}
      <div className="tp-product-details-query">
        <div className="tp-product-details-query-item d-flex align-items-center">
          <span>{t('skuLabel')}</span>
          <p>{sku}</p>
        </div>
        <div className="tp-product-details-query-item d-flex align-items-center">
          <span>{t('categoryLabel')}</span>
          <p>{category}</p>
        </div>
        <div className="tp-product-details-query-item d-flex align-items-center">
          <span>{t('tagLabel')}</span>
          <p>{tag}</p>
        </div>
      </div>

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
      {/* product-details-payment */}
      <div className="tp-product-details-payment d-flex align-items-center flex-wrap justify-content-between">
        <p>{t('safeCheckout')}</p>
        <Image src={payment_option_img} alt="payment_option_img" />
      </div>
    </>
  );
};

export default DetailsBottomInfo;
