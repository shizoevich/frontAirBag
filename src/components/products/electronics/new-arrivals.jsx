'use client';
import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import { NextArr, PrevArr, ShapeLine } from '@/svg';
import ErrorMsg from '@/components/common/error-msg';
import ProductItem from './product-item';
import HomeNewArrivalPrdLoader from '@/components/loader/home/home-newArrival-prd-loader';
import { useGetProductsByCategoryQuery } from '@/redux/features/productsApi';

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

// ID нескольких популярных категорий
// Используем несколько разных ID для повышения шанса получить товары
const POPULAR_CATEGORIES = [
  753896, // Электроника
  753906, // Автозапчасти
  753915, // Бытовая техника
  1,      // Пробуем простые ID
  2,
  3
];

const NewArrivals = () => {
  const [isClient, setIsClient] = useState(false);
  const [products, setProducts] = useState([]);

  // Call the hook for each category at the top level
  const categoryQuery0 = useGetProductsByCategoryQuery(POPULAR_CATEGORIES[0]);
  const categoryQuery1 = useGetProductsByCategoryQuery(POPULAR_CATEGORIES[1]);
  const categoryQuery2 = useGetProductsByCategoryQuery(POPULAR_CATEGORIES[2]);
  const categoryQueries = [categoryQuery0, categoryQuery1, categoryQuery2];

  useEffect(() => {
    setIsClient(true);

    // Aggregate loading and error states
    const loading = categoryQueries.some((q) => q.isLoading);
    const error = categoryQueries.some((q) => q.isError);

    console.log('NewArrivals useEffect - loading:', loading, 'error:', error);
    
    // Логируем состояние запросов по каждой категории
    categoryQueries.forEach((q, index) => {
      console.log(`Категория ${POPULAR_CATEGORIES[index]}:`, {
        loading: q.isLoading,
        error: q.isError,
        data: q.data,
        dataStructure: q.data ? Object.keys(q.data) : 'no data'
      });
    });

    if (loading) {
      console.log('Загрузка товаров еще идет...');
      setProducts([]);
      return;
    }

    if (error) {
      console.log('Ошибка загрузки товаров');
      setProducts([]);
      return;
    }

    // Collect products from all categories
    const allProducts = [];
    categoryQueries.forEach((q, index) => {
      // Проверяем разные возможные структуры данных
      let categoryProducts = [];
      
      if (q.data?.results) {
        // Формат API с пагинацией {count, next, previous, results: []}
        categoryProducts = q.data.results;
      } else if (q.data?.result) {
        // Формат {result: []}
        categoryProducts = q.data.result;
      } else if (q.data?.data) {
        // Формат {data: []}
        categoryProducts = q.data.data;
      } else if (Array.isArray(q.data)) {
        // Формат []
        categoryProducts = q.data;
      }
      
      console.log(`Найдено ${categoryProducts.length} товаров для категории ${POPULAR_CATEGORIES[index]}`);
      
      if (categoryProducts.length > 0) {
        allProducts.push(...categoryProducts.slice(0, 4));
      }
    });

    console.log('Всего товаров найдено:', allProducts.length);
    setProducts(allProducts);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryQueries[0].data, categoryQueries[1].data, categoryQueries[2].data, categoryQueries[0].isLoading, categoryQueries[1].isLoading, categoryQueries[2].isLoading, categoryQueries[0].isError, categoryQueries[1].isError, categoryQueries[2].isError]);

  // Aggregate loading and error states for rendering
  const isLoading = categoryQueries.some((q) => q.isLoading);
  const isError = categoryQueries.some((q) => q.isError);

  if (!isClient) {
    return <div className="tp-product-arrival-area pb-55" />;
  }

  let content = null;

  if (isLoading) {
    content = <HomeNewArrivalPrdLoader loading={isLoading} />;
  } else if (isError) {
    content = <ErrorMsg msg="There was an error loading products" />;
  } else if (products.length === 0) {
    content = <ErrorMsg msg="No products found" />;
  } else {
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
                Popular Products
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