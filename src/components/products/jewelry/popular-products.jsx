'use client';
import React, { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Scrollbar } from 'swiper/modules';
import { useGetShowCategoryQuery, useGetProductsByCategoryIdRemonlineQuery } from '@/redux/features/categoryApi';
import ProductSliderItem from './product-slider-item';
import ErrorMsg from '@/components/common/error-msg';
import { HomeTwoPopularPrdLoader } from '@/components/loader';

// slider setting 
const slider_setting = {
  slidesPerView: 5,
  spaceBetween: 25,
  pagination: {
    el: ".tp-category-slider-dot-4",
    clickable: true,
  },
  scrollbar: {
    el: '.tp-category-swiper-scrollbar',
    draggable: true,
    dragClass: 'tp-swiper-scrollbar-drag',
    snapOnRelease: true,
  },
  breakpoints: {
    1400: { slidesPerView: 5 },
    1200: { slidesPerView: 4 },
    992: { slidesPerView: 3 },
    768: { slidesPerView: 2 },
    576: { slidesPerView: 2 },
    0: { slidesPerView: 1 },
  }
};

const PopularProducts = () => {
  const { data: categories, isLoading: categoriesLoading, isError: categoriesError } = useGetShowCategoryQuery();
  const [activeCategory, setActiveCategory] = useState(null);

  // При загрузке категорий выбираем первую
  useEffect(() => {
    if (categories?.length && !activeCategory) {
      setActiveCategory(categories[0]);
    }
  }, [categories, activeCategory]);

  // Загружаем товары по активной категории
  const {
    data: products,
    isLoading: productsLoading,
    isError: productsError,
  } = useGetProductsByCategoryIdRemonlineQuery(activeCategory?.id_remonline, { skip: !activeCategory });

  // Рендер категорий (например, как табы или кнопки)
  const categoryTabs = categories?.map((cat) => (
    <button
      key={cat.id}
      className={`tp-category-tab-btn ${activeCategory?.id === cat.id ? 'active' : ''}`}
      onClick={() => setActiveCategory(cat)}
      style={{ marginRight: '10px', padding: '6px 12px', cursor: 'pointer' }}
    >
      {cat.title}
    </button>
  ));

  let content = null;

  if (categoriesLoading || productsLoading) {
    content = <HomeTwoPopularPrdLoader loading={true} />;
  } else if (categoriesError || productsError) {
    content = <ErrorMsg msg="Ошибка загрузки категорий или товаров" />;
  } else if (!products || products.length === 0) {
    content = <ErrorMsg msg="Товары не найдены" />;
  } else {
    const product_items = products.slice(0, 8);
    content = (
      <Swiper {...slider_setting} modules={[Scrollbar, Pagination]} className="tp-category-slider-active-4 swiper-container mb-70">
        {product_items.map(item => (
          <SwiperSlide key={item.id}>
            <ProductSliderItem product={item} />
          </SwiperSlide>
        ))}
      </Swiper>
    );
  }

  return (
    <section className="tp-category-area pt-115 pb-105 tp-category-plr-85" style={{ backgroundColor: '#EFF1F5' }}>
      <div className="container-fluid">
        <div className="row mb-4">
          <div className="col-xl-12 text-center">
            <div className="tp-section-title-wrapper-4 mb-3">
              <span className="tp-section-title-pre-4">Shop by Category</span>
              <h3 className="tp-section-title-4">Popular on the Shofy store.</h3>
            </div>
            <div className="category-tabs-wrapper">
              {categoryTabs}
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-xl-12">
            <div className="tp-category-slider-4">
              {content}
              <div className="tp-category-swiper-scrollbar tp-swiper-scrollbar"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PopularProducts;
