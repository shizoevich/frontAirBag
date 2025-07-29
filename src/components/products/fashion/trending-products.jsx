'use client';
import React, { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import Link from 'next/link';
import { ArrowRightLong, TextShapeLine } from '@/svg';
import ProductItem from './product-item';
import ErrorMsg from '@/components/common/error-msg';
import { HomeTwoNewPrdPrdLoader } from '@/components/loader';
import trending_banner from '@assets/img/product/trending/banner/trending-banner.jpg';

// Здесь предполагается, что у тебя есть API хук для получения категорий и товаров
import { useGetShowCategoriesQuery, useGetProductsByCategoryQuery } from '@/redux/features/productsApi';

const slider_setting = {
  slidesPerView: 2,
  spaceBetween: 24,
  pagination: {
    el: ".tp-trending-slider-dot",
    clickable: true,
  },
  breakpoints: {
    1200: { slidesPerView: 2 },
    768: { slidesPerView: 2 },
    576: { slidesPerView: 2 },
    0: { slidesPerView: 1 },
  }
}

const TrendingProducts = () => {
  const { data: categories, isLoading: loadingCategories, isError: errorCategories } = useGetShowCategoriesQuery();
  const [activeCategoryId, setActiveCategoryId] = useState(null);

  useEffect(() => {
    if (categories?.length && !activeCategoryId) {
      setActiveCategoryId(categories[0].id); // или id_remonline, смотря что у тебя
    }
  }, [categories, activeCategoryId]);

  // Получаем товары по выбранной категории, где есть параметр new=true (трендовые)
  const { data: products, isLoading: loadingProducts, isError: errorProducts } = useGetProductsByCategoryQuery(
    { categoryId: activeCategoryId, query: 'new=true' },
    { skip: !activeCategoryId }
  );

  const categoryButtons = categories?.map(cat => (
    <button
      key={cat.id}
      onClick={() => setActiveCategoryId(cat.id)}
      className={`tp-category-btn ${activeCategoryId === cat.id ? 'active' : ''}`}
      style={{ marginRight: 10, padding: '6px 12px', cursor: 'pointer' }}
    >
      {cat.title}
    </button>
  ));

  let content = null;

  if (loadingCategories || loadingProducts) {
    content = <HomeTwoNewPrdPrdLoader loading={true} />;
  } else if (errorCategories || errorProducts) {
    content = <ErrorMsg msg="Ошибка загрузки категорий или товаров" />;
  } else if (!products || products.length === 0) {
    content = <ErrorMsg msg="Товары не найдены" />;
  } else {
    const product_items = products.slice(0, 5);
    content = (
      <Swiper {...slider_setting} modules={[Pagination]} className="tp-trending-slider-active swiper-container">
        {product_items.map(item => (
          <SwiperSlide key={item._id} className="tp-trending-item">
            <ProductItem product={item} style_2={true} />
          </SwiperSlide>
        ))}
      </Swiper>
    );
  }

  return (
    <section className="tp-trending-area pt-140 pb-150">
      <div className="container">
        <div className="row justify-content-center mb-4">
          <div className="col-xl-12 text-center">
            <div className="category-buttons-wrapper">
              {categoryButtons}
            </div>
          </div>
        </div>

        <div className="row justify-content-center">
          <div className="col-xl-6 col-lg-6">
            <div className="tp-trending-wrapper">
              <div className="tp-section-title-wrapper-2 mb-50">
                <span className="tp-section-title-pre-2">
                  More to Discover
                  <TextShapeLine />
                </span>
                <h3 className="tp-section-title-2">Trending Arrivals</h3>
              </div>
              <div className="tp-trending-slider">
                {content}
                <div className="tp-trending-slider-dot tp-swiper-dot text-center mt-45"></div>
              </div>
            </div>
          </div>
          <div className="col-xl-4 col-lg-5 col-md-8 col-sm-10">
            <div className="tp-trending-banner p-relative ml-35">
              <div
                className="tp-trending-banner-thumb w-img include-bg"
                style={{ backgroundImage: `url(${trending_banner.src})` }}
              ></div>
              <div className="tp-trending-banner-content">
                <h3 className="tp-trending-banner-title">
                  <Link href="/shop">
                    Short Sleeve Tunic <br /> Tops Casual Swing
                  </Link>
                </h3>
                <div className="tp-trending-banner-btn">
                  <Link
                    href="/shop"
                    className="tp-btn tp-btn-border tp-btn-border-white tp-btn-border-white-sm"
                  >
                    Explore More
                    <ArrowRightLong />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrendingProducts;
