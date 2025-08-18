'use client';
import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
// internal
import ErrorMsg from '../common/error-msg';
import { useGetShowCategoryQuery } from '@/redux/features/categoryApi';
import HomeCateLoader from '../loader/home/home-cate-loader';

const CategoryGrid = () => {
  const { data: categoriesData, isLoading, isError } = useGetShowCategoryQuery();
  const router = useRouter();
  
  // Обрабатываем данные категорий
  const allCategories = categoriesData?.data || [];
  
  // Показываем только первые 9 категорий для карточек (или можно выбрать определенные)
  const categories = allCategories.slice(0, 9);
  
  console.log('CategoryGrid - Raw data:', categoriesData);
  console.log('CategoryGrid - All categories:', allCategories.length);
  console.log('CategoryGrid - Displayed categories:', categories.length);

  // Переход по категории
  const handleCategoryRoute = (title, categoryId) => {
    // Маппинг ID категорий на slug для правильной маршрутизации
    const idToSlugMap = {
      // Автомобильные марки (подкатегории Covers)
      753903: 'acura',
      753902: 'audi', 
      753904: 'bmw',
      753906: 'buick',
      1121716: 'cadillac',
      753907: 'chevrolet',
      753905: 'dodge',
      1140060: 'fiat',
      753908: 'ford',
      1121717: 'gmc',
      753909: 'honda',
      753900: 'hyundai',
      753922: 'infiniti',
      1140061: 'jaguar',
      753896: 'jeep',
      1121713: 'kia',
      753901: 'lexus',
      1077872: 'land-rover',
      753910: 'lincoln',
      1140062: 'mini-cooper',
      753912: 'mazda',
      1121715: 'mercedes',
      753911: 'mitsubishi',
      1105320: 'mustang',
      753913: 'nissan',
      875421: 'porsche',
      753914: 'subaru',
      753915: 'toyota',
      753921: 'tesla',
      753916: 'vw',
      1140059: 'volvo',
      
      // Комплектующие Airbag SRS
      753917: 'connectors',
      753918: 'mounts',
      753919: 'resistors',
      753897: 'airbags',
      753899: 'belt-parts',
      
      // Пиропатроны
      753898: 'pyro-seats',
      753920: 'pyro-belts',
      753924: 'pyro-curtains',
      753926: 'pyro-steering-1',
      753925: 'pyro-steering-2',
      753928: 'pyro-dashboard-1',
      753927: 'pyro-dashboard-2'
    };
    
    // Переходим на главную страницу с фильтрацией по ID категории
    router.push(`/?categoryId=${categoryId}&categoryName=${encodeURIComponent(title)}`);
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
            <a className="cursor-pointer" onClick={() => handleCategoryRoute(item.title, item.id)}>
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
              <a className="cursor-pointer" onClick={() => handleCategoryRoute(item.title, item.id)}>
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