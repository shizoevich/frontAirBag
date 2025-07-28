'use client';
import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import { NextArr, PrevArr, ShapeLine } from '@/svg';
import ErrorMsg from '@/components/common/error-msg';
import ProductItem from './product-item';
import HomeNewArrivalPrdLoader from '@/components/loader/home/home-newArrival-prd-loader';
import { useGetGoodsByCategoryQuery } from '@/redux/features/goodsApi';

const sliderSettings = {
  slidesPerView: 4,
  spaceBetween: 30,
  pagination: {
    el: ".tp-arrival-slider-dot",
    clickable: true,
  },
  navigation: {
    nextEl: ".tp-arrival-slider-button-next",
    prevEl: ".tp-arrival-slider-button-prev",
  },
  breakpoints: {
    '1200': { slidesPerView: 4 },
    '992': { slidesPerView: 3 },
    '768': { slidesPerView: 2 },
    '576': { slidesPerView: 2 },
    '0': { slidesPerView: 1 },
  }
};

const NewArrivals = () => {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Получаем товары категории electronics
  const { data: products, isError, isLoading } = useGetGoodsByCategoryQuery('electronics');

  if (!isClient) {
    return <div className="tp-product-arrival-area pb-55" />;
  }

  let content = null;

  if (isLoading) {
    content = <HomeNewArrivalPrdLoader loading={isLoading} />;
  }
  if (!isLoading && isError) {
    content = <ErrorMsg msg="There was an error" />;
  }
  if (!isLoading && !isError && products?.length === 0) {
    content = <ErrorMsg msg="No Products found!" />;
  }
  if (!isLoading && !isError && products?.length > 0) {
    content = (
      <Swiper 
        {...sliderSettings} 
        modules={[Navigation, Pagination]} 
        className="tp-product-arrival-active swiper-container"
      >
        {products.map((product) => (
          <SwiperSlide key={product.id}>
            <ProductItem product={product} />
          </SwiperSlide>
        ))}
      </Swiper>
    );
  }

  return (
    <section className="tp-product-arrival-area pb-55">
      <div className="container">
        <div className="row align-items-end">
          <div className="col-xl-5 col-sm-6">
            <div className="tp-section-title-wrapper mb-40">
              <h3 className="tp-section-title">
                Electronics Products
                <ShapeLine />
              </h3>
            </div>
          </div>
          <div className="col-xl-7 col-sm-6">
            <div className="tp-product-arrival-more-wrapper d-flex justify-content-end">
              <div className="tp-product-arrival-arrow tp-swiper-arrow mb-40 text-end tp-product-arrival-border">
                <button type="button" className="tp-arrival-slider-button-prev">
                  <PrevArr />
                </button>
                <button type="button" className="tp-arrival-slider-button-next">
                  <NextArr />
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-xl-12">
            <div className="tp-product-arrival-slider fix">
              {content}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewArrivals;