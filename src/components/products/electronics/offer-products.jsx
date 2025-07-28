'use client';
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import Link from "next/link";
// internal
import ProductItem from "./product-item";
import { useGetFeaturedProductsQuery } from "@/redux/features/productsApi";
import { ArrowRightLong, ShapeLine } from "@/svg";
import ErrorMsg from "@/components/common/error-msg";
import HomeProductLoader from "@/components/loader/home/home-gadget-prd-loader";

// Настройки слайдера
const sliderSetting = {
  slidesPerView: 3,
  spaceBetween: 30,
  pagination: {
    el: ".tp-products-slider-dot",
    clickable: true,
  },
  breakpoints: {
    1200: { slidesPerView: 3 },
    992: { slidesPerView: 2 },
    768: { slidesPerView: 2 },
    576: { slidesPerView: 1 },
    0: { slidesPerView: 1 },
  },
};

const FeaturedProducts = () => {
  // Получаем товары без акций
  const {data: products, isError, isLoading} = useGetFeaturedProductsQuery("electronics");
  
  // Определяем что рендерить
  let content = null;

  if (isLoading) {
    content = <HomeProductLoader loading={isLoading} />;
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
        {...sliderSetting}
        modules={[Pagination]}
        className="tp-products-slider-active swiper-container"
      >
        {products.map((item) => (
          <SwiperSlide key={item.id}>
            <ProductItem product={item} />
          </SwiperSlide>
        ))}
        <div className="tp-products-slider-dot tp-swiper-dot text-center mt-40"></div>
      </Swiper>
    );
  }

  return (
    <section className="tp-products grey-bg-2 pt-70 pb-80">
      <div className="container">
        <div className="row align-items-end">
          <div className="col-xl-4 col-md-5 col-sm-6">
            <div className="tp-section-title-wrapper mb-40">
              <h3 className="tp-section-title">
                Featured Products
                <ShapeLine />
              </h3>
            </div>
          </div>
          <div className="col-xl-8 col-md-7 col-sm-6">
            <div className="tp-products-more-wrapper d-flex justify-content-sm-end p-relative z-index-1">
              <div className="tp-products-more mb-40 text-sm-end grey-bg-2">
                <Link href="/shop" className="tp-btn tp-btn-2 tp-btn-blue">
                  View All Products
                  <ArrowRightLong />
                </Link>
                <span className="tp-products-more-border"></span>
              </div>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-xl-12">
            <div className="tp-products-slider fix">{content}</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;