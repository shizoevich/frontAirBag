'use client';
import React from 'react';
import { useTranslations } from 'next-intl';
import ProductItem from '../products/electronics/product-item';

const ProductsBoughtTogether = ({ togetherBuyProducts }) => {
  const t = useTranslations('ProductDetails');

  // Не показываем блок если нет товаров
  if (!togetherBuyProducts || !Array.isArray(togetherBuyProducts) || togetherBuyProducts.length === 0) {
    return null;
  }

  return (
    <section className="tp-bought-together-product pt-95 pb-120">
      <div className="container">
        <div className="row">
          <div className="col-xl-12">
            <div className="tp-section-title-wrapper-6 text-center mb-40">
              <h3 className="tp-section-title-6">{t('boughtTogether')}</h3>
            </div>
          </div>
        </div>
        <div className="row">
          {togetherBuyProducts.map((product, index) => (
            <div key={product.id || product._id || index} className="col-xl-3 col-lg-4 col-md-6 col-sm-6">
              <ProductItem product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductsBoughtTogether;
