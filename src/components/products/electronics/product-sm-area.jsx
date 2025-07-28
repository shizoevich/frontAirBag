'use client';
import React from 'react';
import { ShapeLineSm } from '@/svg';
import { useGetGoodsByCategoryQuery } from '@/redux/features/goodsApi';
import ErrorMsg from '@/components/common/error-msg';
import ProductSmItem from './product-sm-item';
import HomeSmPrdLoader from '@/components/loader/home/home-sm-prd-loader';

const ProductSmArea = () => {
  // Получаем товары категории electronics
  const { data: products, isError, isLoading } = useGetGoodsByCategoryQuery('electronics');
  
  // Фильтрация и сортировка товаров
  const discountProducts = products?.filter(p => p.discount > 0).slice(0, 3) || [];
  const featuredProducts = products?.filter(p => p.featured).slice(0, 3) || [];
  const topSellingProducts = products?.slice().sort((a, b) => b.sellCount - a.sellCount).slice(0, 3) || [];

  // Логика рендеринга
  let content = null;

  if (isLoading) {
    content = <HomeSmPrdLoader loading={isLoading} />;
  }
  if (!isLoading && isError) {
    content = <ErrorMsg msg="There was an error" />;
  }
  if (!isLoading && !isError && products?.length === 0) {
    content = <ErrorMsg msg="No Products found!" />;
  }
  if (!isLoading && !isError && products?.length > 0) {
    content = (
      <div className="row">
        {/* Секция товаров со скидкой */}
        <div className="col-xl-4 col-md-6">
          <div className="tp-product-sm-list mb-50">
            <div className="tp-section-title-wrapper mb-40">
              <h3 className="tp-section-title tp-section-title-sm">
                Discount Products
                <ShapeLineSm />
              </h3>
            </div>
            <div className="tp-product-sm-wrapper mr-20">
              {discountProducts.map(item => (
                <ProductSmItem key={item.id} product={item} />
              ))}
            </div>
          </div>
        </div>

        {/* Секция рекомендуемых товаров */}
        <div className="col-xl-4 col-md-6">
          <div className="tp-product-sm-list mb-50">
            <div className="tp-section-title-wrapper mb-40">
              <h3 className="tp-section-title tp-section-title-sm">
                Featured Products
                <ShapeLineSm />
              </h3>
            </div>
            <div className="tp-product-sm-wrapper mr-20">
              {featuredProducts.map(item => (
                <ProductSmItem key={item.id} product={item} />
              ))}
            </div>
          </div>
        </div>

        {/* Секция популярных товаров */}
        <div className="col-xl-4 col-md-6">
          <div className="tp-product-sm-list mb-50">
            <div className="tp-section-title-wrapper mb-40">
              <h3 className="tp-section-title tp-section-title-sm">
                Top Selling
                <ShapeLineSm />
              </h3>
            </div>
            <div className="tp-product-sm-wrapper mr-20">
              {topSellingProducts.map(item => (
                <ProductSmItem key={item.id} product={item} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="tp-product-sm-area">
      <div className="container">
        {content}
      </div>
    </section>
  );
};

export default ProductSmArea;