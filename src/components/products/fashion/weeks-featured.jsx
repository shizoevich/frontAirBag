'use client';
import React, { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { Rating } from 'react-simple-star-rating';
import Link from 'next/link';
// internal
import { useGetShowCategoryQuery} from '@/redux/features/categoryApi';
import { useGetFeaturedProductsQuery } from '@/redux/features/productsApi';
import { ArrowRightLong, NextLongArr, PrevLongArr, TextShapeLine } from '@/svg';
import ErrorMsg from '@/components/common/error-msg';
import { HomeTwoFeaturedPrdLoader } from '@/components/loader';

// slider setting 
const slider_setting = {
  slidesPerView: 3,
  spaceBetween: 10,
  navigation: {
    nextEl: ".tp-featured-slider-button-next",
    prevEl: ".tp-featured-slider-button-prev",
  },
  breakpoints: {
    1200: { slidesPerView: 3 },
    992: { slidesPerView: 3 },
    768: { slidesPerView: 2 },
    576: { slidesPerView: 1 },
    0: { slidesPerView: 1 },
  }
}

const WeeksFeatured = () => {
  const { data: categories, isLoading: categoriesLoading, isError: categoriesError } = useGetShowCategoryQuery();
  const [activeCategoryId, setActiveCategoryId] = useState(null);

  useEffect(() => {
    if (categories?.length && !activeCategoryId) {
      setActiveCategoryId(categories[0].id_remonline || categories[0].id); // выбери подходящий id
    }
  }, [categories, activeCategoryId]);

  const { data: products, isError: productsError, isLoading: productsLoading } = 
    useGetFeaturedProductsQuery(activeCategoryId, { skip: !activeCategoryId });

  // Категории как кнопки для переключения
  const categoryButtons = categories?.map(cat => (
    <button
      key={cat.id}
      onClick={() => setActiveCategoryId(cat.id_remonline || cat.id)}
      className={`tp-category-btn ${activeCategoryId === (cat.id_remonline || cat.id) ? 'active' : ''}`}
      style={{ marginRight: 10, padding: '6px 12px', cursor: 'pointer' }}
    >
      {cat.title}
    </button>
  ));

  let content = null;

  if (categoriesLoading || productsLoading) {
    content = <HomeTwoFeaturedPrdLoader loading={true} />;
  } else if (categoriesError || productsError) {
    content = <ErrorMsg msg="Ошибка загрузки категорий или товаров" />;
  } else if (!products || products.length === 0) {
    content = <ErrorMsg msg="Рекомендуемые товары не найдены" />;
  } else {
    content = (
      <Swiper {...slider_setting} modules={[Navigation]} className="tp-featured-slider-active swiper-container">
        {products.map(item => {
          const {_id, img, title, price, discount, reviews } = item || {};
          return (
            <SwiperSlide key={item.id || _id} className="tp-featured-item white-bg p-relative z-index-1">
              <div className="tp-featured-thumb include-bg" style={{ backgroundImage: `url(${img})` }}></div>
              <div className="tp-featured-content">
                <h3 className="tp-featured-title">
                  <Link href={`/product-details/${item.id || _id}`}>{title}</Link>
                </h3>
                <div className="tp-featured-price-wrapper">
                  {discount > 0 ? (
                    <>
                      <span className="tp-featured-price new-price">${price}</span>
                      <span className="tp-featured-price old-price">
                        {" "} $ {(Number(price) - (Number(price) * Number(discount)) / 100).toFixed(2)}
                      </span>
                    </>
                  ) : (
                    <span className="tp-featured-price new-price">${price}</span>
                  )}
                </div>
                <div className="tp-product-rating-icon tp-product-rating-icon-2">
                  <Rating
                    allowFraction
                    size={16}
                    initialValue={reviews && reviews.length > 0
                      ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
                      : 0}
                    readonly={true}
                  />
                </div>
                <div className="tp-featured-btn">
                  <Link href={`/product-details/${item.id || _id}`} className="tp-btn tp-btn-border tp-btn-border-sm">
                    Shop Now <ArrowRightLong />
                  </Link>
                </div>
              </div>
            </SwiperSlide>
          )
        })}
      </Swiper>
    );
  }

  return (
    <section className="tp-featured-slider-area grey-bg-6 fix pt-95 pb-120">
      <div className="container">
        <div className="row mb-4">
          <div className="col-xl-12 text-center">
            <div className="tp-section-title-wrapper-2 mb-3">
              <span className="tp-section-title-pre-2">
                Shop by Featured
                <TextShapeLine />
              </span>
              <h3 className="tp-section-title-2"></h3>
            </div>
            <div className="category-buttons-wrapper">
              {categoryButtons}
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-xl-12">
            <div className="tp-featured-slider">
              {content}
              <div className="tp-featured-slider-arrow mt-45">
                <button className="tp-featured-slider-button-prev"><PrevLongArr /></button>
                <button className="tp-featured-slider-button-next"><NextLongArr /></button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WeeksFeatured;
