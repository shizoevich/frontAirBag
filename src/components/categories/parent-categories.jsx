'use client';
import React from 'react';
import { useTranslations } from 'next-intl';
import ErrorMsg from '@/components/common/error-msg';
import HomeCateLoader from '../loader/home/home-cate-loader';
import Image from 'next/image';

const ParentCategories = ({ 
  categories = [], 
  isLoading, 
  isError, 
  selectedParentCategory, 
  onParentCategorySelect 
}) => {
  const t = useTranslations('ParentCategories');
  
  // Идентификаторы родительских категорий (Covers, Комплектующие Airbag SRS, Пиропатроны)
  const parentCategoryIds = [754099, 754100, 754101];
  
  console.log('All categories in parent-categories.jsx:', categories);
  
  // Фильтруем только родительские категории из полученных данных
  let parentCategories = categories.filter(cat => {
    if (!cat) return false;
    return parentCategoryIds.includes(Number(cat.id));
  });
  
  // Сортируем родительские категории в нужном порядке
  parentCategories = parentCategories.sort((a, b) => {
    const indexA = parentCategoryIds.indexOf(Number(a.id));
    const indexB = parentCategoryIds.indexOf(Number(b.id));
    return indexA - indexB;
  });
  
  // Если родительские категории не найдены, создаем их вручную
  if (parentCategories.length === 0) {
    console.log('Родительские категории не найдены, создаем вручную');
    parentCategories = [
      { id: 754099, title: t('covers'), image: "noimage.png" },
      { id: 754100, title: t('airbag_components'), image: "noimage.png" },
      { id: 754101, title: t('squibs'), image: "noimage.png" }
    ];
  }
  
  // Добавляем опцию "Все категории"
  const allCategoriesOption = {
    id: 'all',
    title: t('all_categories'),
    parent_id: null,
    image: "noimage.png"
  };
  
  const displayCategories = [allCategoriesOption, ...parentCategories];
  
  let content = null;
  
  if (isLoading) {
    content = <HomeCateLoader loading={isLoading} />;
  }
  
  if (!isLoading && isError) {
    content = <ErrorMsg msg={t('loadingError')} />;
  }
  
  if (!isLoading && !isError && (!displayCategories || displayCategories.length === 0)) {
    content = <ErrorMsg msg={t('noCategoriesFound')} />;
  }
  
  if (!isLoading && !isError && displayCategories && displayCategories.length > 0) {
    content = (
      <div className="parent-categories-wrapper">
        <div className="parent-categories-list d-flex flex-wrap">
          {displayCategories.map((category) => {
            const categoryId = category.id === 'all' ? null : Number(category.id);
            const isActive = selectedParentCategory === categoryId;
            const imagePath = category.image ? `/assets/img/category/${category.image}` : '/assets/img/category/noimage.png';
            
            return (
              <div 
                key={category.id} 
                className={`parent-category-item ${isActive ? 'active' : ''}`}
                onClick={() => onParentCategorySelect(categoryId)}
              >
                <div 
                  className="parent-category-btn d-flex align-items-center"
                  style={{
                    padding: '10px 16px',
                    margin: '0 12px 12px 0',
                    cursor: 'pointer',
                    borderRadius: '8px',
                    backgroundColor: isActive ? '#de8043' : '#f8f9fa',
                    border: isActive ? 'none' : '1px solid #dee2e6',
                    color: isActive ? '#fff' : '#212529',
                    fontWeight: isActive ? 'bold' : 'normal',
                    transition: 'all 0.3s ease',
                    boxShadow: isActive ? '0 4px 8px rgba(0,0,0,0.1)' : 'none'
                  }}
                >
                  <span>{category.title}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  
  return (
    <div className="parent-categories-container mb-4">
      <h2 className="mb-3">{t('selectCategory')}</h2>
      
      {content}
      
    </div>
  );
};

export default ParentCategories;