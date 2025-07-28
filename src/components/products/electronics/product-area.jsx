'use client';
import React, { useState } from "react";
import { useGetGoodsByCategoryQuery } from "@/redux/features/goodsApi";
import { ShapeLine } from "@/svg";
import ProductItem from "./product-item";
import ErrorMsg from "@/components/common/error-msg";
import HomePrdLoader from "@/components/loader/home/home-prd-loader";
import { getRootCategories, getChildCategories } from "@/data/categories";

const ProductArea = () => {
  const rootCategories = getRootCategories();
  const [activeCategoryId, setActiveCategoryId] = useState(rootCategories[0]?.id || 0);
  const { data: goods, isLoading, isError } = useGetGoodsByCategoryQuery(activeCategoryId);

  // Получаем дочерние категории для активной родительской
  const activeRootCategory = rootCategories.find(cat => cat.id === activeCategoryId) || 
                           rootCategories[0];
  const childCategories = getChildCategories(activeRootCategory.id);

  // Логика рендеринга
  let content = null;

  if (isLoading) {
    content = <HomePrdLoader loading={isLoading} />;
  }
  
  if (!isLoading && isError) {
    content = <ErrorMsg msg="Ошибка загрузки товаров" />;
  }
  
  if (!isLoading && !isError && (!goods || goods.length === 0)) {
    content = <ErrorMsg msg="Товары не найдены" />;
  }
  
  if (!isLoading && !isError && goods?.length > 0) {
    content = goods.map((product) => (
      <div key={product.id} className="col-xl-3 col-lg-3 col-sm-6">
        <ProductItem product={product} />  
      </div>
    ));
  }

  return (
    <section className="tp-product-area pb-55">
      <div className="container">
        <div className="row align-items-end">
          <div className="col-xl-5 col-lg-6 col-md-5">
            <div className="tp-section-title-wrapper mb-40">
              <h3 className="tp-section-title">
                Наши товары
                <ShapeLine />
              </h3>
            </div>
          </div>
          <div className="col-xl-7 col-lg-6 col-md-7">
            <div className="tp-product-tab tp-product-tab-border mb-45 tp-tab d-flex justify-content-md-end">
              {/* Основные категории */}
              <ul className="nav nav-tabs justify-content-sm-end">
                {rootCategories.map((category) => (
                  <li key={category.id} className="nav-item">
                    <button
                      onClick={() => setActiveCategoryId(category.id)}
                      className={`nav-link ${activeRootCategory.id === category.id ? "active" : ""}`}
                    >
                      {category.title}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Подкатегории */}
            {childCategories.length > 0 && (
              <div className="tp-product-subcategories mb-30">
                <div className="tp-product-tab tp-product-tab-border">
                  <ul className="nav nav-tabs">
                    {childCategories.map((subCategory) => (
                      <li key={subCategory.id} className="nav-item">
                        <button
                          onClick={() => setActiveCategoryId(subCategory.id)}
                          className={`nav-link ${activeCategoryId === subCategory.id ? "active" : ""}`}
                        >
                          {subCategory.title}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="row">
          {content}
        </div>
      </div>
    </section>
  );
};

export default ProductArea;