'use client';
import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
// internal
import ErrorMsg from '../common/error-msg';
import { useGetShowCategoryQuery } from '@/redux/features/categoryApi';
import HomeCateLoader from '../loader/home/home-cate-loader';

const CategoryGrid = () => {
  const { data: categories, isLoading, isError } = useGetShowCategoryQuery();
  const router = useRouter();

  // Переход по категории
  const handleCategoryRoute = (title) => {
    const slug = title.toLowerCase().replace("&", "").split(" ").join("-");
    router.push(`/shop?category=${slug}`);
  };

  // Контент
  let content = null;

  if (isLoading) {
    content = <HomeCateLoader loading={isLoading} />;
  }

  if (!isLoading && isError) {
    content = <ErrorMsg msg="There was an error" />;
  }

  if (!isLoading && !isError && categories?.length === 0) {
    content = <ErrorMsg msg="No Category found!" />;
  }

  if (!isLoading && !isError && categories?.length > 0) {
    content = categories.map((item) => (
      <div className="col" key={item.id}>
        <div className="tp-product-category-item text-center mb-40">
          <div className="tp-product-category-thumb fix">
            <a className="cursor-pointer" onClick={() => handleCategoryRoute(item.title)}>
              {item.img && (
                <Image
                  src={item.img}
                  alt="product-category"
                  width={76}
                  height={98}
                />
              )}
            </a>
          </div>
          <div className="tp-product-category-content">
            <h3 className="tp-product-category-title">
              <a className="cursor-pointer" onClick={() => handleCategoryRoute(item.title)}>
                {item.title}
              </a>
            </h3>
            {item.products && (
              <p>{item.products.length} Product{item.products.length !== 1 ? 's' : ''}</p>
            )}
          </div>
        </div>
      </div>
    ));
  }

  return (
    <section className="tp-product-category pt-60 pb-15">
      <div className="container">
        <div className="row row-cols-xl-5 row-cols-lg-5 row-cols-md-4">
          {content}
        </div>
      </div>
    </section>
  );
};

export default CategoryGrid;
