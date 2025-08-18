'use client';
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from 'next-intl';
import ErrorMsg from "../common/error-msg";
import { useGetShowCategoryQuery } from "@/redux/features/categoryApi";
import { useRouter } from "next/navigation";
import ShopCategoryLoader from "../loader/shop/shop-category-loader";

const AirbagComponentsArea = () => {
  const t = useTranslations('Categories');
  const { data: categories, isLoading, isError } = useGetShowCategoryQuery();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Обработчик поиска
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Получаем только накладки (covers) и марки автомобилей
  const getAirbagComponents = () => {
    if (!categories) return [];
    
    // Получаем категории из правильного поля в зависимости от структуры данных
    let allCategories = [];
    if (categories?.results && Array.isArray(categories.results)) {
      allCategories = categories.results;
    } else if (Array.isArray(categories)) {
      allCategories = categories;
    }
    
    // Фильтруем только накладки (covers - ID: 754099) и марки автомобилей
    return allCategories.filter(category => {
      if (!category) return false;
      
      // Показываем категорию Covers (ID: 754099)
      if (String(category.id) === '754099') {
        return true;
      }
      
      // Показываем подкатегории Covers (parent_id === 754099) - это марки автомобилей
      if (category.parent_id && String(category.parent_id) === '754099') {
        return true;
      }
      
      return false;
    });
  };
  
  // Фильтруем компоненты по поисковому запросу
  const filteredComponents = getAirbagComponents().filter(component => 
    component.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Обработчик клика по компоненту
  const handleComponentClick = (component) => {
    router.push(`/search?category=${component.id}`);
  };

  // Решаем, что отображать
  let content = null;

  if (isLoading) {
    content = <ShopCategoryLoader loading={isLoading} />;
  }
  
  if (!isLoading && isError) {
    content = <ErrorMsg msg={t('loadingError')} />;
  }
  
  if (!isLoading && !isError && filteredComponents.length === 0) {
    content = <ErrorMsg msg={t('noComponentsFound')} />;
  }
  
  if (!isLoading && !isError && filteredComponents.length > 0) {
    content = (
      <div className="row">
        {filteredComponents.map((component) => (
          <div key={component.id} className="col-lg-4 col-md-6 col-sm-6 mb-30">
            <div 
              className="tp-category-item text-center p-relative mb-40 fix"
              onClick={() => handleComponentClick(component)}
            >
              <div className="tp-category-thumb">
                <Image 
                  src={`/assets/img/category/${component.image || 'noimage.png'}`} 
                  alt={component.title}
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
                  <Link href={`/search?category=${component.id}`}>
                    {component.title}
                  </Link>
                </h3>
                <p className="tp-category-subtitle">
                  {getComponentDescription(component.title)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Функция для получения описания компонента на основе его названия
  const getComponentDescription = (title) => {
    const descriptions = {
      'Конектори': t('connectors_description'),
      'Кріплення': t('fasteners_description'),
      'Обманки (Резистори)': t('resistors_description'),
      'Парашути (Мішки)': t('airbags_description'),
      'Запчастини для Ременів': t('belt_parts_description'),
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
                {t('airbag_components')}
                <span className="tp-section-title-inner">
                  {t('airbag_components_subtitle')}
                </span>
              </h3>
            </div>
          </div>
        </div>
        
        {/* Поиск по компонентам */}
        <div className="row justify-content-center mb-50">
          <div className="col-xl-6 col-lg-8">
            <div className="tp-search-box">
              <input 
                type="text" 
                placeholder={t('search_components')} 
                value={searchTerm}
                onChange={handleSearch}
              />
              <button>
                <i className="flaticon-search"></i>
              </button>
            </div>
          </div>
        </div>
        
        {/* Список компонентов */}
        {content}
        
        {/* SEO-описание */}
        <div className="row mt-50">
          <div className="col-xl-12">
            <div className="tp-category-seo-content">
              <h4>{t('airbag_components_seo_title')}</h4>
              <p>{t('airbag_components_seo_description')}</p>
              <ul className="mt-20">
                <li>{t('connectors_description')}</li>
                <li>{t('fasteners_description')}</li>
                <li>{t('resistors_description')}</li>
                <li>{t('airbags_description')}</li>
                <li>{t('belt_parts_description')}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AirbagComponentsArea;