'use client';
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from 'next-intl';
import ErrorMsg from "../common/error-msg";
import { useGetShowCategoryQuery } from "@/redux/features/categoryApi";
import { useRouter } from "next/navigation";
import ShopCategoryLoader from "../loader/shop/shop-category-loader";

const CarBrandsArea = () => {
  const t = useTranslations('Categories');
  const { data: categories, isLoading, isError } = useGetShowCategoryQuery();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Обработчик поиска
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Получаем только марки автомобилей (parent_id === 754099)
  const getCarBrands = () => {
    if (!categories) return [];
    
    // Получаем категории из правильного поля в зависимости от структуры данных
    let allCategories = [];
    if (categories?.results && Array.isArray(categories.results)) {
      allCategories = categories.results;
    } else if (Array.isArray(categories)) {
      allCategories = categories;
    }
    
    // Фильтруем только марки автомобилей (parent_id === 754099)
    return allCategories.filter(category => 
      category && 
      category.parent_id && 
      String(category.parent_id) === '754099'
    );
  };
  
  // Фильтруем марки по поисковому запросу
  const filteredBrands = getCarBrands().filter(brand => 
    brand.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Обработчик клика по бренду
  const handleBrandClick = (brand) => {
    router.push(`/search?category=${brand.id}`);
  };

  // Решаем, что отображать
  let content = null;

  if (isLoading) {
    content = <ShopCategoryLoader loading={isLoading} />;
  }
  
  if (!isLoading && isError) {
    content = <ErrorMsg msg={t('loadingError')} />;
  }
  
  if (!isLoading && !isError && filteredBrands.length === 0) {
    content = <ErrorMsg msg={t('noBrandsFound')} />;
  }
  
  if (!isLoading && !isError && filteredBrands.length > 0) {
    content = (
      <div className="row">
        {filteredBrands.map((brand) => (
          <div key={brand.id} className="col-lg-3 col-md-4 col-sm-6 mb-30">
            <div 
              className="tp-category-item text-center p-relative mb-40 fix"
              onClick={() => handleBrandClick(brand)}
            >
              <div className="tp-category-thumb">
                <Image 
                  src={`/assets/img/category/${brand.image || 'noimage.png'}`} 
                  alt={brand.title}
                  width={200}
                  height={200}
                  style={{ objectFit: 'contain' }}
                  onError={(e) => {
                    e.target.src = '/assets/img/category/noimage.png';
                  }}
                />
              </div>
              <div className="tp-category-content">
                <h3 className="tp-category-title">
                  <Link href={`/search?category=${brand.id}`}>
                    {brand.title}
                  </Link>
                </h3>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <section className="tp-category-area pb-120 pt-95">
      <div className="container">
        <div className="row">
          <div className="col-xl-12">
            <div className="tp-section-title-wrapper text-center mb-50">
              <h3 className="tp-section-title">
                {t('car_brands')}
                <span className="tp-section-title-inner">
                  {t('select_car_brand')}
                </span>
              </h3>
            </div>
          </div>
        </div>
        {/* Список брендов */}
        {content}
        
        {/* SEO-описание */}
        <div className="row mt-50">
          <div className="col-xl-12">
            <div className="tp-category-seo-content">
              <h4>{t('car_mats_by_brand')}</h4>
              <p>{t('search_parts_by_car_brand')}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CarBrandsArea;