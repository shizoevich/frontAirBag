'use client';
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from 'next-intl';
import ErrorMsg from "../common/error-msg";
import { useGetShowCategoryQuery } from "@/redux/features/categoryApi";
import { useRouter } from "next/navigation";
import ShopCategoryLoader from "../loader/shop/shop-category-loader";

const PyrotechnicsArea = () => {
  const t = useTranslations('Categories');
  const { data: categories, isLoading, isError } = useGetShowCategoryQuery();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Обработчик поиска
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Получаем только подкатегории пиропатронов (parent_id === 754101)
  const getPyrotechnics = () => {
    if (!categories) return [];
    
    // Получаем категории из правильного поля в зависимости от структуры данных
    let allCategories = [];
    if (categories?.results && Array.isArray(categories.results)) {
      allCategories = categories.results;
    } else if (Array.isArray(categories)) {
      allCategories = categories;
    }
    
    // Фильтруем только подкатегории пиропатронов (parent_id === 754101)
    return allCategories.filter(category => 
      category && 
      category.parent_id && 
      String(category.parent_id) === '754101'
    );
  };
  
  // Фильтруем пиропатроны по поисковому запросу
  const filteredPyrotechnics = getPyrotechnics().filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Обработчик клика по категории
  const handlePyrotechnicClick = (item) => {
    router.push(`/search?category=${item.id}`);
  };

  // Решаем, что отображать
  let content = null;

  if (isLoading) {
    content = <ShopCategoryLoader loading={isLoading} />;
  }
  
  if (!isLoading && isError) {
    content = <ErrorMsg msg={t('loadingError')} />;
  }
  
  if (!isLoading && !isError && filteredPyrotechnics.length === 0) {
    content = <ErrorMsg msg={t('noPyrotechnicsFound')} />;
  }
  
  if (!isLoading && !isError && filteredPyrotechnics.length > 0) {
    content = (
      <div className="row">
        {filteredPyrotechnics.map((item) => (
          <div key={item.id} className="col-lg-4 col-md-6 col-sm-6 mb-30">
            <div 
              className="tp-category-item text-center p-relative mb-40 fix"
              onClick={() => handlePyrotechnicClick(item)}
            >
              <div className="tp-category-thumb">
                <Image 
                  src={`/assets/img/category/${item.image || 'noimage.png'}`} 
                  alt={item.title}
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
                  <Link href={`/search?category=${item.id}`}>
                    {item.title}
                  </Link>
                </h3>
                <p className="tp-category-subtitle">
                  {getPyrotechnicDescription(item.title)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Функция для получения описания пиропатрона на основе его названия
  const getPyrotechnicDescription = (title) => {
    const descriptions = {
      'ПП в ремені': t('belt_pyrotechnics_description'),
      'ПП в ноги': t('leg_pyrotechnics_description'),
      'ПП в сидіння': t('seat_pyrotechnics_description'),
      'ПП в штори': t('curtain_pyrotechnics_description'),
      'ПП в кермо': t('steering_pyrotechnics_description'),
      'ПП в торпедо': t('dashboard_pyrotechnics_description'),
      // Добавьте другие описания по необходимости
    };
    
    // Ищем соответствие по ключевым словам в названии
    for (const key in descriptions) {
      if (title.includes(key)) {
        return descriptions[key];
      }
    }
    
    return '';
  };

  return (
    <section className="tp-category-area pb-120 pt-95">
      <div className="container">
        <div className="row">
          <div className="col-xl-12">
            <div className="tp-section-title-wrapper text-center mb-50">
              <h3 className="tp-section-title">
                {t('pyrotechnics')}
                <span className="tp-section-title-inner">
                  {t('pyrotechnics_subtitle')}
                </span>
              </h3>
            </div>
          </div>
        </div>
        
        {/* Поиск по пиропатронам */}
        <div className="row justify-content-center mb-50">
          <div className="col-xl-6 col-lg-8">
            <div className="tp-search-box">
              <input 
                type="text" 
                placeholder={t('search_pyrotechnics')} 
                value={searchTerm}
                onChange={handleSearch}
              />
              <button>
                <i className="flaticon-search"></i>
              </button>
            </div>
          </div>
        </div>
        
        {/* Список пиропатронов */}
        {content}
        
        {/* SEO-описание */}
        <div className="row mt-50">
          <div className="col-xl-12">
            <div className="tp-category-seo-content">
              <h4>{t('pyrotechnics_seo_title')}</h4>
              <p>{t('pyrotechnics_seo_description')}</p>
              <ul className="mt-20">
                <li>{t('belt_pyrotechnics_description')}</li>
                <li>{t('leg_pyrotechnics_description')}</li>
                <li>{t('seat_pyrotechnics_description')}</li>
                <li>{t('curtain_pyrotechnics_description')}</li>
                <li>{t('steering_pyrotechnics_description')}</li>
                <li>{t('dashboard_pyrotechnics_description')}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PyrotechnicsArea;