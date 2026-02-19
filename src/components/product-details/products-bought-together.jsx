'use client';
import React from 'react';
import { useTranslations } from 'next-intl';
import ProductItem from '../products/electronics/product-item';
import { useGetProductsByMultipleIdsQuery } from '@/redux/features/productsApi';
import { useGetProductsByIdsQuery } from '@/redux/features/productsApi';
import { HomeNewArrivalPrdLoader } from '../loader';
import ErrorMsg from '../common/error-msg';

const ProductsBoughtTogether = ({ togetherBuyProducts }) => {
  const t = useTranslations('ProductDetails');

  // Debug: логируем входящие данные
  console.log('ProductsBoughtTogether - togetherBuyProducts:', togetherBuyProducts);
  console.log('ProductsBoughtTogether - isArray:', Array.isArray(togetherBuyProducts));
  console.log('ProductsBoughtTogether - length:', togetherBuyProducts?.length);

  // Убираем дубликаты и получаем уникальные ID
  const uniqueIds = togetherBuyProducts ? [...new Set(togetherBuyProducts)] : [];
  
  const productQueries = uniqueIds.map(id => {
    const query = useGetProductsByIdsQuery(id, { skip: !id });
    console.log(`ProductsBoughtTogether - Query for ID ${id}:`, {
      data: query.data,
      isLoading: query.isLoading,
      isError: query.isError,
      error: query.error
    });
    return query;
  });
  // Собираем результаты всех запросов
  const productsData = {
    data: productQueries
      .map(query => query.data)
      .filter(data => data && !data.error), // Фильтруем успешные ответы
    isLoading: productQueries.some(query => query.isLoading),
    isError: productQueries.some(query => query.isError)
  };

  // Не показываем блок если нет товаров
  if (!uniqueIds.length) {
    console.log('ProductsBoughtTogether - returning null due to empty data');
    return null;
  }
  
    // Debug: логируем результат API запроса
    console.log('ProductsBoughtTogether - API result:', { productsData, productQueries });
  
    // Показываем лоадер во время загрузки
    if (productsData.isLoading) {
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
    if (productsData.isError) {
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