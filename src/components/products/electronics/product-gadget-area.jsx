'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectFade, Pagination } from 'swiper/modules';
import Link from 'next/link';
// internal
import { ArrowRight } from '@/svg';
import ProductItem from './product-item';
import ErrorMsg from '@/components/common/error-msg';
import b_bg_1 from '@assets/img/product/gadget/gadget-banner-1.jpg';
import b_bg_2 from '@assets/img/product/gadget/gadget-banner-2.jpg';
import { useGetProductsByCategoryQuery, useGetProductCategoriesQuery } from '@/redux/features/productsApi';
import gadget_girl from '@assets/img/product/gadget/gadget-girl.png';
import HomeGadgetPrdLoader from '@/components/loader/home/home-gadget-prd-loader';

const ProductGadgetArea = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  
  // Получаем список категорий
  const { data: categories } = useGetProductCategoriesQuery();
  
  // Получаем товары выбранной категории
  const { 
    data: products, 
    isError, 
    isLoading 
  } = useGetProductsByCategoryQuery(selectedCategory || categories?.[0]?.id);

  // decide what to render
  let content = null;

  if (isLoading) {
    content = <HomeGadgetPrdLoader loading={isLoading} />;
  }
  if (!isLoading && isError) {
    content = <ErrorMsg msg="There was an error" />;
  }
  if (!isLoading && !isError && products?.length === 0) {
    content = <ErrorMsg msg="No Products found!" />;
  }
  if (!isLoading && !isError && products?.length > 0) {
    content = products.slice(0, 6).map((product) => (
      <div key={product.id} className="col-xl-4 col-sm-6">
        <ProductItem product={product} />
      </div>
    ));
  }

  // Компонент баннера (остается без изменений)
  const GadgetBanner = () => {
    // ... (прежняя реализация)
  };

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
                  {categories?.map((category) => (
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
              <div className="row">
                {content}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductGadgetArea;