'use client';
import React, { useEffect, useRef, useState } from 'react';
import ErrorMsg from '@/components/common/error-msg';
import ProductItem from './product-item';
import { HomeTwoPrdLoader } from '@/components/loader';
import { useGetShowCategoryQuery } from '@/redux/features/categoryApi';
import { useGetProductsByCategoryIdRemonlineQuery } from '@/redux/features/categoryApi';

const ProductArea = () => {
  // Загружаем категории
  const { data: categories, isLoading: categoriesLoading, isError: categoriesError } = useGetShowCategoryQuery();

  // Активная категория
  const [activeCategory, setActiveCategory] = useState(null);

  // При загрузке категорий выставляем первую
  useEffect(() => {
    if (categories?.length && !activeCategory) {
      setActiveCategory(categories[0]);
    }
  }, [categories, activeCategory]);

  // Для таба позиция и ширина маркера
  const activeRef = useRef(null);
  const marker = useRef(null);

  useEffect(() => {
    if (activeRef.current && marker.current) {
      marker.current.style.left = activeRef.current.offsetLeft + "px";
      marker.current.style.width = activeRef.current.offsetWidth + "px";
    }
  }, [activeCategory, categories]);

  // Загружаем товары по активной категории
  const {
    data: products,
    isLoading: productsLoading,
    isError: productsError,
  } = useGetProductsByCategoryIdRemonlineQuery(activeCategory?.id_remonline, { skip: !activeCategory });

  // Логика контента
  let content = null;

  if (categoriesLoading || productsLoading) {
    content = <HomeTwoPrdLoader loading={true} />;
  } else if (categoriesError || productsError) {
    content = <ErrorMsg msg="Ошибка при загрузке категорий или товаров" />;
  } else if (!products || products.length === 0) {
    content = <ErrorMsg msg="Товары не найдены" />;
  } else {
    content = (
      <>
        <div className="row align-items-end">
          <div className="col-xl-6 col-lg-6">
            <div className="tp-section-title-wrapper-4 mb-40 text-center text-lg-start">
              <span className="tp-section-title-pre-4">Категории товаров</span>
              <h3 className="tp-section-title-4">Выберите категорию</h3>
            </div>
          </div>
          <div className="col-xl-6 col-lg-6">
            <div className="tp-product-tab-2 tp-product-tab-3  tp-tab mb-45">
              <div className="tp-product-tab-inner-3 d-flex align-items-center justify-content-center justify-content-lg-end">
                <nav>
                  <div
                    className="nav nav-tabs justify-content-center tp-product-tab tp-tab-menu p-relative"
                    id="nav-tab"
                    role="tablist"
                  >
                    {categories.map((category, i) => (
                      <button
                        key={category.id}
                        ref={activeCategory?.id === category.id ? activeRef : null}
                        onClick={() => setActiveCategory(category)}
                        className={`nav-link text-capitalize ${activeCategory?.id === category.id ? 'active' : ''}`}
                      >
                        {category.title}
                        <span className="tp-product-tab-tooltip">
                          {/* Кол-во товаров в категории можно добавить, если API позволяет */}
                          {products.length}
                        </span>
                      </button>
                    ))}

                    <span
                      ref={marker}
                      id="productTabMarker"
                      className="tp-tab-line d-none d-sm-inline-block"
                    ></span>
                  </div>
                </nav>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          {products.map((prd) => (
            <div key={prd.id} className="col-xl-3 col-lg-4 col-sm-6">
              <ProductItem product={prd} />
            </div>
          ))}
        </div>
      </>
    );
  }

  return (
    <section className="tp-product-area pt-115 pb-80">
      <div className="container">{content}</div>
    </section>
  );
};

export default ProductArea;
