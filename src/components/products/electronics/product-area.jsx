'use client';
import React, { useEffect, useState, useMemo } from "react";
import { useGetShowCategoryQuery, useGetProductsByCategoryIdRemonlineQuery } from "@/redux/features/categoryApi";
import ErrorMsg from "@/components/common/error-msg";
import { HomeNewArrivalPrdLoader } from "@/components/loader";
import HomePrdLoader from "@/components/loader/home/home-prd-loader";
import ProductItem from "./product-item";
import { useTranslations } from 'next-intl';
import { ShapeLine } from "@/svg";

const ProductArea = () => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    data: categoriesData,
    isLoading: catLoading,
    isError: catError
  } = useGetShowCategoryQuery();

  // Преобразуем данные категорий в массив с useMemo для оптимизации
  const categories = useMemo(() => {
    return Array.isArray(categoriesData) 
      ? categoriesData 
      : Array.isArray(categoriesData?.data) 
        ? categoriesData.data 
        : Array.isArray(categoriesData?.results) 
          ? categoriesData.results 
          : [];
  }, [categoriesData]);

  const [activeCategoryId, setActiveCategoryId] = useState(null);

  useEffect(() => {
    if (!catLoading && !catError && categories.length > 0 && !activeCategoryId) {
      const firstCategory = categories[0];
      // Безопасное получение id_remonline
      const id = firstCategory.id_remonline || firstCategory.category?.id_remonline;
      if (id) {
        setActiveCategoryId(id);
      }
    }
  }, [catLoading, catError, categories, activeCategoryId]);

  const {
    data: products = [],
    isLoading: productsLoading,
    isError: productsError
  } = useGetProductsByCategoryIdRemonlineQuery(activeCategoryId, {
    skip: !activeCategoryId,
  });

  if (!mounted) return null;

  // Контент товаров
  let content = null;

  if (productsLoading) {
    content = <HomePrdLoader loading />;
  } else if (productsError) {
    content = <ErrorMsg msg="Ошибка загрузки товаров" />;
  } else if (!products || products.length === 0) {
    content = <ErrorMsg msg="Товары не найдены" />;
  } else {
    content = products.map((product) => (
      <div key={product.id} className="col-xl-3 col-lg-3 col-sm-6">
        <ProductItem product={product} />
      </div>
    ));
  }

  // Контент категорий
  let categoryTabs = null;
  
  if (catLoading) {
    categoryTabs = <span>Загрузка категорий...</span>;
  } else if (catError) {
    categoryTabs = <ErrorMsg msg="Ошибка загрузки категорий" />;
  } else {
    categoryTabs = (
      <ul className="nav nav-tabs justify-content-sm-end">
        {categories.map((cat) => {
          const categoryId = cat.id_remonline || cat.category?.id_remonline;
          return (
            <li key={cat.id} className="nav-item">
              <button
                onClick={() => setActiveCategoryId(categoryId)}
                className={`nav-link ${activeCategoryId === categoryId ? "active" : ""}`}
              >
                {cat.title}
              </button>
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <section className="tp-product-area pb-55">
      <div className="container">
        <div className="row align-items-end">
          <div className="col-xl-5 col-lg-6 col-md-5">
            <div className="tp-section-title-wrapper mb-40">
              <h3 className="tp-section-title">
                Наши товары <ShapeLine />
              </h3>
            </div>
          </div>
          <div className="col-xl-7 col-lg-6 col-md-7">
            <div className="tp-product-tab tp-product-tab-border mb-45 tp-tab d-flex justify-content-md-end">
              {categoryTabs}
            </div>
          </div>
        </div>
        <div className="row">{content}</div>
      </div>
    </section>
  );
};

export default ProductArea;