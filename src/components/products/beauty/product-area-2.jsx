'use client';
import React, { useEffect, useRef, useState } from "react";
import { useGetShowCategoryQuery, useGetProductsByCategoryIdRemonlineQuery } from "@/redux/features/categoryApi";
import ProductItem from "./product-item";
import ErrorMsg from "@/components/common/error-msg";
import { HomeThreePrdTwoLoader } from "@/components/loader";

const ProductAreaTwo = () => {
  const { 
    data: categories, 
    isLoading: isLoadingCategories, 
    isError: isErrorCategories 
  } = useGetShowCategoryQuery();

  const [activeCategory, setActiveCategory] = useState(null);
  const activeRef = useRef(null);
  const marker = useRef(null);

  const { 
    data: products, 
    isLoading: isLoadingProducts, 
    isError: isErrorProducts 
  } = useGetProductsByCategoryIdRemonlineQuery(activeCategory?.id_remonline, {
    skip: !activeCategory?.id_remonline // Пропускаем запрос, если id_remonline не задан
  });

  // Устанавливаем первую категорию по умолчанию
  useEffect(() => {
    if (categories?.length > 0 && !activeCategory) {
      const firstCategory = categories[0];
      console.log("Активная категория:", firstCategory); // Для отладки
      setActiveCategory(firstCategory);
    }
  }, [categories, activeCategory]);

  // Обновляем позицию маркера при смене категории
  useEffect(() => {
    if (activeRef.current && marker.current) {
      marker.current.style.left = `${activeRef.current.offsetLeft}px`;
      marker.current.style.width = `${activeRef.current.offsetWidth}px`;
    }
  }, [activeCategory]);

  const handleTabClick = (category) => {
    setActiveCategory(category);
  };

  // Обработка состояний загрузки и ошибок
  if (isLoadingCategories) {
    return <HomeThreePrdTwoLoader loading={true} />;
  }

  if (isErrorCategories) {
    return <ErrorMsg msg="Ошибка загрузки категорий" />;
  }

  if (!categories?.length) {
    return <ErrorMsg msg="Категории не найдены" />;
  }

  if (!activeCategory) {
    return <HomeThreePrdTwoLoader loading={true} />;
  }

  return (
    <section className="tp-best-area pb-60 pt-130">
      <div className="container">
        <div className="row align-items-end">
          <div className="col-xl-6 col-lg-6">
            <div className="tp-section-title-wrapper-3 mb-45 text-center text-lg-start">
              <span className="tp-section-title-pre-3">Каталог</span>
              <h3 className="tp-section-title-3">Автозапчасти по категориям</h3>
            </div>
          </div>
          <div className="col-xl-6 col-lg-6">
            <div className="tp-product-tab-2 tp-product-tab-3 tp-tab mb-50 text-center">
              <div className="tp-product-tab-inner-3 d-flex align-items-center justify-content-center justify-content-lg-end">
                <nav>
                  <div className="nav nav-tabs justify-content-center tp-product-tab tp-tab-menu p-relative" role="tablist">
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        ref={activeCategory?.id === cat.id ? activeRef : null}
                        onClick={() => handleTabClick(cat)}
                        className={`nav-link text-capitalize ${activeCategory?.id === cat.id ? "active" : ""}`}
                      >
                        {cat.title}
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

        {isLoadingProducts ? (
          <HomeThreePrdTwoLoader loading={true} />
        ) : isErrorProducts ? (
          <ErrorMsg msg="Ошибка загрузки товаров" />
        ) : !products?.length ? (
          <ErrorMsg msg="Товары не найдены" />
        ) : (
          <div className="row">
            {products.map((prd) => (
              <div key={prd.id} className="col-lg-3 col-md-4 col-sm-6">
                <ProductItem product={prd} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductAreaTwo;