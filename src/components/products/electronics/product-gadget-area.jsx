'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
// internal
import { ArrowRight } from '@/svg';
import ProductItem from './product-item';
import ErrorMsg from '@/components/common/error-msg';
import gadget_girl from '@assets/img/product/gadget/gadget-girl.png';
import HomeGadgetPrdLoader from '@/components/loader/home/home-gadget-prd-loader';
import { useGetProductsByCategoryQuery, useGetProductCategoriesQuery } from '@/redux/features/productsApi';

const ProductGadgetArea = () => {
  const { data: categories, isLoading: isCategoriesLoading, isError: isCategoriesError } = useGetProductCategoriesQuery();
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Автоматически устанавливаем первую категорию при загрузке categories
  useEffect(() => {
    if (categories?.length && !selectedCategory) {
      setSelectedCategory(categories[0].id);
    }
  }, [categories, selectedCategory]);

  // Запрос товаров только если есть selectedCategory
  const { data: products, isError, isLoading } = useGetProductsByCategoryQuery(selectedCategory, {
    skip: !selectedCategory,  // пропускаем запрос пока нет категории
  });

  // Решаем, что рендерить
  let content = null;

  if (isLoading || isCategoriesLoading) {
    content = <HomeGadgetPrdLoader loading={true} />;
  } else if (isError || isCategoriesError) {
    content = <ErrorMsg msg="There was an error" />;
  } else if (!products || products.length === 0) {
    content = <ErrorMsg msg="No Products found!" />;
  } else {
    content = products.slice(0, 6).map(product => (
      <div key={product.id} className="col-xl-4 col-sm-6">
        <ProductItem product={product} />
      </div>
    ));
  }

  // Баннер (простой пример)
  const GadgetBanner = () => (
    <div className="banner">
      <Image src={gadget_girl} alt="Gadget Girl" />
    </div>
  );

  return (
    <section className="tp-product-gadget-area pt-80 pb-75">
      <div className="container">
        <div className="row">
          <div className="col-xl-4 col-lg-5">
            <div className="tp-product-gadget-sidebar mb-40">
              <div className="tp-product-gadget-categories p-relative fix mb-10">
                <div className="tp-product-gadget-thumb">
                  <Image src={gadget_girl} alt="gadget_girl" priority />
                </div>
                <h3 className="tp-product-gadget-categories-title">
                  Electronics <br /> Gadgets
                </h3>

                <div className="tp-product-gadget-categories-list">
                  {categories?.map(category => (
                    <button
                      key={category.id}
                      className={`category-btn ${selectedCategory === category.id ? 'active' : ''}`}
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>

                <div className="tp-product-gadget-btn">
                  <Link href="/shop" className="tp-link-btn">
                    More Products
                    <ArrowRight />
                  </Link>
                </div>
              </div>
              <div className="tp-product-gadget-banner">
                <GadgetBanner />
              </div>
            </div>
          </div>
          <div className="col-xl-8 col-lg-7">
            <div className="tp-product-gadget-wrapper">
              <div className="row">{content}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductGadgetArea;
