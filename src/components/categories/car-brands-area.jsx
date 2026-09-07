'use client';
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations, useLocale } from 'next-intl';
import ErrorMsg from "../common/error-msg";
import { categoryPath } from "@/utils/category-link";
import { categoryImage, FALLBACK_CATEGORY_IMAGE } from "@/utils/category-image";
import { useGetShowCategoryQuery } from "@/redux/features/categoryApi";
import { useRouter } from "next/navigation";
import ShopCategoryLoader from "../loader/shop/shop-category-loader";

const CarBrandsArea = () => {
  const t = useTranslations('Categories');
  const locale = useLocale();
  const { data: categories, isLoading, isError } = useGetShowCategoryQuery();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Обработчик поиска
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // «Накладки» — родитель всех марок. Марки это его подкатегории.
  const COVERS_CATEGORY_ID = '754099';

  const allCategories = React.useMemo(() => {
    if (!categories) return [];
    if (Array.isArray(categories?.results)) return categories.results;
    return Array.isArray(categories) ? categories : [];
  }, [categories]);

  // Получаем только марки автомобилей (parent_id === 754099)
  const getCarBrands = () =>
    allCategories.filter(
      (category) =>
        category && category.parent_id && String(category.parent_id) === COVERS_CATEGORY_ID
    );

  // Сама категория «Накладки»: с неё начинается список, чтобы можно было посмотреть
  // все накладки сразу, не выбирая марку. На прежней странице марок такая плитка была,
  // и терять её при переезде незачем.
  const coversCategory = allCategories.find(
    (category) => category && String(category.id) === COVERS_CATEGORY_ID
  );
  
  // Фильтруем марки по поисковому запросу
  const filteredBrands = getCarBrands().filter(brand => 
    brand.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Обработчик клика по бренду
  const handleBrandClick = (brand) => {
    router.push(`/${locale}${categoryPath(brand)}`);
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
        {coversCategory && !searchTerm && (
          <div key="all-covers" className="col-lg-3 col-md-4 col-sm-6 mb-30">
            <div
              className="tp-category-item text-center p-relative mb-40 fix"
              onClick={() => handleBrandClick(coversCategory)}
            >
              <div className="tp-category-thumb">
                <Image
                  src={categoryImage(coversCategory)}
                  alt={t('all_covers')}
                  width={200}
                  height={200}
                  style={{ objectFit: 'contain' }}
                  onError={(e) => {
                    e.target.src = FALLBACK_CATEGORY_IMAGE;
                  }}
                />
              </div>
              <div className="tp-category-content">
                <h3 className="tp-category-title">
                  <Link href={`/${locale}${categoryPath(coversCategory)}`}>
                    {t('all_covers')}
                  </Link>
                </h3>
              </div>
            </div>
          </div>
        )}
        {filteredBrands.map((brand) => (
          <div key={brand.id} className="col-lg-3 col-md-4 col-sm-6 mb-30">
            <div 
              className="tp-category-item text-center p-relative mb-40 fix"
              onClick={() => handleBrandClick(brand)}
            >
              <div className="tp-category-thumb">
                <Image 
                  src={categoryImage(brand)} 
                  alt={brand.title}
                  width={200}
                  height={200}
                  style={{ objectFit: 'contain' }}
                  onError={(e) => {
                    e.target.src = FALLBACK_CATEGORY_IMAGE;
                  }}
                />
              </div>
              <div className="tp-category-content">
                <h3 className="tp-category-title">
                  <Link href={`/${locale}${categoryPath(brand)}`}>
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
              <h3 className="tp-section-title">{t('car_brands')}</h3>
              <p className="tp-section-title-sub">{t('select_car_brand')}</p>
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