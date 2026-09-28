'use client';
import React from 'react';
import { useTranslations } from 'next-intl';
import ProductItem from '../products/electronics/product-item';
import { useGetProductsByMultipleIdsQuery } from '@/redux/features/productsApi';
import { HomeNewArrivalPrdLoader } from '../loader';
import ErrorMsg from '../common/error-msg';

const SectionWrapper = ({ title, children }) => (
  <section className="tp-bought-together-product pt-20 pb-50">
    <div className="container">
      <div className="row">
        <div className="col-xl-12">
          <div className="tp-section-title-wrapper-6 text-center mb-40">
            <h3 className="tp-section-title-6">{title}</h3>
          </div>
        </div>
      </div>
      {children}
    </div>
  </section>
);

const ProductsBoughtTogether = ({ togetherBuyProducts }) => {
  const t = useTranslations('ProductDetails');

  // Убираем дубликаты: RemOnline может прислать один и тот же id несколько раз
  const uniqueIds = togetherBuyProducts ? [...new Set(togetherBuyProducts)] : [];

  const { data: productsResponse, isLoading, isError } = useGetProductsByMultipleIdsQuery(uniqueIds, {
    skip: !uniqueIds.length,
  });

  if (!uniqueIds.length) {
    return null;
  }

  if (isLoading) {
    return (
      <SectionWrapper title={t('boughtTogether')}>
        <HomeNewArrivalPrdLoader loading={true} />
      </SectionWrapper>
    );
  }

  if (isError) {
    return (
      <SectionWrapper title={t('boughtTogether')}>
        <ErrorMsg msg="Ошибка загрузки связанных товаров" />
      </SectionWrapper>
    );
  }

  const products = productsResponse?.data || [];

  if (products.length === 0) {
    return null;
  }

  return (
    <SectionWrapper title={t('boughtTogether')}>
      <div className="row">
        {products.map((product, index) => (
          <div key={product.id || product._id || index} className="col-xl-3 col-lg-4 col-md-6 col-sm-6">
            <ProductItem product={product} />
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
};

export default ProductsBoughtTogether;
