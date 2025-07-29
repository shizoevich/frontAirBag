'use client';
import React, { useEffect, useState } from 'react';
import ErrorMsg from '@/components/common/error-msg';
import { useGetShowCategoriesQuery, useGetProductsByCategoryQuery } from '@/redux/features/productsApi';
import { TextShapeLine } from '@/svg';
import ProductItem from './product-item';
import { HomeTwoPrdLoader } from '@/components/loader';

const ProductArea = () => {
  // Загружаем категории
  const { data: categories, isLoading: loadingCategories, isError: errorCategories } = useGetShowCategoriesQuery();
  
  // Состояние выбранной категории
  const [activeCategoryId, setActiveCategoryId] = useState(null);

  // При загрузке категорий автоматически выбрать первую
  useEffect(() => {
    if (categories?.length && !activeCategoryId) {
      setActiveCategoryId(categories[0].id);
    }
  }, [categories, activeCategoryId]);

  // Загружаем товары по выбранной категории
  const { data: products, isLoading: loadingProducts, isError: errorProducts } = useGetProductsByCategoryQuery(
    activeCategoryId,
    { skip: !activeCategoryId }
  );

  const handleActiveTab = (id) => {
    setActiveCategoryId(id);
  };

  // Формируем кнопки табов из категорий
  const tabs = categories?.map(cat => ({
    id: cat.id,
    name: cat.title
  })) || [];

  // Считаем количество товаров под выбранную категорию
  const productCount = products?.length || 0;

  // Решаем, что отображать
  let content = null;

  if (loadingCategories || loadingProducts) {
    content = <HomeTwoPrdLoader loading={true} />;
  } else if (errorCategories || errorProducts) {
    content = <ErrorMsg msg="Ошибка загрузки данных" />;
  } else if (!products || products.length === 0) {
    content = <ErrorMsg msg="Нет товаров в выбранной категории" />;
  } else {
    content = (
      <div className="row">
        {products.map(prd => (
          <div key={prd._id} className="col-xl-3 col-lg-4 col-md-6 col-sm-6">
            <ProductItem product={prd} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <section className="tp-product-area pb-90">
      <div className="container">
        <div className="row">
          <div className="col-xl-12">
            <div className="tp-section-title-wrapper-2 text-center mb-35">
              <span className="tp-section-title-pre-2">
                All Product Shop
                <TextShapeLine />
              </span>
              <h3 className="tp-section-title-2">Customer Favorite Style Product</h3>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-xl-12">
            <div className="tp-product-tab-2 tp-tab mb-50 text-center">
              <nav>
                <div className="nav nav-tabs justify-content-center">
                  {tabs.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => handleActiveTab(tab.id)}
                      className={`nav-link text-capitalize ${activeCategoryId === tab.id ? "active" : ""}`}
                    >
                      {tab.name}
                      <span className="tp-product-tab-tooltip">{activeCategoryId === tab.id ? productCount : ''}</span>
                    </button>
                  ))}
                </div>
              </nav>
            </div>
          </div>
        </div>

        {content}
      </div>
    </section>
  );
};

export default ProductArea;
