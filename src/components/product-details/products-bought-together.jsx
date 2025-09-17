'use client';
import React from 'react';
import { useTranslations } from 'next-intl';
import ProductItem from '../products/electronics/product-item';
import { useGetProductsByIdsQuery } from '@/redux/features/productsApi';
import { HomeNewArrivalPrdLoader } from '../loader';
import ErrorMsg from '../common/error-msg';

const ProductsBoughtTogether = ({ togetherBuyProducts }) => {
  const t = useTranslations('ProductDetails');

  // Debug: логируем входящие данные
  console.log('ProductsBoughtTogether - togetherBuyProducts:', togetherBuyProducts);
  console.log('ProductsBoughtTogether - isArray:', Array.isArray(togetherBuyProducts));
  console.log('ProductsBoughtTogether - length:', togetherBuyProducts?.length);

  // Не показываем блок если нет товаров
  if (!togetherBuyProducts || !Array.isArray(togetherBuyProducts) || togetherBuyProducts.length === 0) {
    console.log('ProductsBoughtTogether - returning null due to empty data');
    return null;
  }

  // Получаем полные данные товаров по их ID
  const { data: productsData, isLoading, isError } = useGetProductsByIdsQuery(togetherBuyProducts);
  
  // Debug: логируем результат API запроса
  console.log('ProductsBoughtTogether - API result:', { productsData, isLoading, isError });
  
  // Показываем лоадер во время загрузки
  if (isLoading) {
    return (
      <section className="tp-bought-together-product pt-20 pb-50">
        <div className="container">
          <div className="row">
            <div className="col-xl-12">
              <div className="tp-section-title-wrapper-6 text-center mb-40">
                <h3 className="tp-section-title-6">{t('boughtTogether')}</h3>
              </div>
            </div>
          </div>
          <HomeNewArrivalPrdLoader loading={true} />
        </div>
      </section>
    );
  }

  // Показываем ошибку если что-то пошло не так
  if (isError) {
    return (
      <section className="tp-bought-together-product pt-20 pb-50">
        <div className="container">
          <div className="row">
            <div className="col-xl-12">
              <div className="tp-section-title-wrapper-6 text-center mb-40">
                <h3 className="tp-section-title-6">{t('boughtTogether')}</h3>
              </div>
            </div>
          </div>
          <ErrorMsg msg="Ошибка загрузки связанных товаров" />
        </div>
      </section>
    );
  }

  // Получаем товары из ответа API
  const products = productsData?.data || [];
  
  // Не показываем блок если нет товаров после загрузки
  if (products.length === 0) {
    return null;
  }

  return (
    <section className="tp-bought-together-product pt-20 pb-50">
      <div className="container">
        <div className="row">
          <div className="col-xl-12">
            <div className="tp-section-title-wrapper-6 text-center mb-40">
              <h3 className="tp-section-title-6">{t('boughtTogether')}</h3>
            </div>
          </div>
        </div>
        <div className="row">
          {products.map((product, index) => (
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
