'use client';
import React, { useEffect, useState, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation, EffectFade } from 'swiper/modules';
import Image from 'next/image';
// internal imports
import { ArrowNextSm, ArrowPrevSm, PlusTwo } from '@/svg';
import ProductItem from './product-item';
import ErrorMsg from '@/components/common/error-msg';
import { HomeThreeTrendingPrdLoader } from '@/components/loader';
import { useGetShowCategoryQuery, useGetProductsByCategoryIdRemonlineQuery } from '@/redux/features/categoryApi';

const sliderSetting = {
  slidesPerView: 1,
  spaceBetween: 0,
  effect: 'fade',
  pagination: {
    el: ".tp-special-slider-dot",
    clickable: true,
  },
  navigation: {
    nextEl: ".tp-special-slider-button-next",
    prevEl: ".tp-special-slider-button-prev",
  }
};

const TrendingSpecialPrd = () => {
  // Загружаем категории
  const { data: categories, isLoading: loadingCategories, isError: errorCategories } = useGetShowCategoryQuery();
  const [activeCategory, setActiveCategory] = useState(null);

  // После загрузки категорий выставляем первую активной
  useEffect(() => {
    if (categories?.length && !activeCategory) {
      setActiveCategory(categories[0]);
    }
  }, [categories, activeCategory]);

  // Подгружаем товары по активной категории (id_remonline)
  const { data: products, isLoading, isError } = useGetProductsByCategoryIdRemonlineQuery(
    activeCategory?.id_remonline,
    { skip: !activeCategory }
  );

  // Рендер товаров и состояния
  let content = null;
  if (loadingCategories || isLoading) {
    content = <HomeThreeTrendingPrdLoader loading={true} />;
  } else if (errorCategories || isError) {
    content = <ErrorMsg msg="Ошибка при загрузке товаров или категорий" />;
  } else if (!products || products.length === 0) {
    content = <ErrorMsg msg="Товары не найдены" />;
  } else {
    const product_items = products.slice(0, 7);
    content = (
      <Swiper {...sliderSetting} modules={[Pagination, Navigation, EffectFade]} className="tp-special-slider-active swiper-container">
        {product_items.map((item) => (
          <SwiperSlide key={item.id} className="tp-special-item grey-bg-9">
            <ProductItem product={item} prdCenter={true} />
          </SwiperSlide>
        ))}
      </Swiper>
    );
  }

  return (
    <section className="tp-special-area fix">
      <div className="container">
        <div className="row gx-2">
          <div className="col-xl-5 col-md-6">
            <div className="tp-special-slider-thumb">
              {/* Можно сюда вставить статичное или динамическое изображение */}
              {/* Например, пока оставим статичное заглушку */}
              <Image
                src="/images/product/special/big/special-big-1.jpg"
                alt="special-big img"
                width={500}
                height={500}
                priority
              />
              <div className="tp-special-hotspot-item tp-special-hotspot-1">
                <span className="tp-hotspot tp-pulse-border ">
                  <PlusTwo />
                </span>
                <div className="tp-special-hotspot-content">
                  <h3 className="tp-special-hotspot-title">Автозапчасти</h3>
                  <p>Лучшие запчасти для вашего автомобиля</p>
                </div>
              </div>
              <div className="tp-special-hotspot-item tp-special-hotspot-2">
                <span className="tp-hotspot tp-pulse-border ">
                  <PlusTwo />
                </span>
                <div className="tp-special-hotspot-content">
                  <h3 className="tp-special-hotspot-title">Надежность и качество</h3>
                  <p>Гарантия оригинальных комплектующих</p>
                </div>
              </div>
            </div>
          </div>

          <div className="col-xl-7 col-md-6">
            <div className="tp-special-wrapper grey-bg-9 pt-85 pb-35">
              <div className="tp-section-title-wrapper-3 mb-40 text-center">
                <span className="tp-section-title-pre-3">Тренды недели</span>
                <h3 className="tp-section-title-3">Специальные предложения</h3>
              </div>
              <div className="tp-special-slider">
                <div className="row gx-0 justify-content-center">
                  <div className="col-xl-5 col-lg-7 col-md-9 col-sm-7">
                    <div className="tp-special-slider-inner p-relative">
                      {content}
                      {/* dot style */}
                      <div className="tp-swiper-dot tp-special-slider-dot d-sm-none text-center"></div>
                      <div className="tp-special-arrow d-none d-sm-block">
                        <button className="tp-special-slider-button-prev">
                          <ArrowPrevSm />
                        </button>

                        <button className="tp-special-slider-button-next">
                          <ArrowNextSm />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default TrendingSpecialPrd;
