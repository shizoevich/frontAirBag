'use client';
import React from 'react';
import { useTranslations } from 'next-intl';
import ErrorMsg from '@/components/common/error-msg';
import HomeCateLoader from '../loader/home/home-cate-loader';

const ParentCategories = ({ 
  categories = [],      // Массив категорий первого уровня
  isLoading, 
  isError, 
  selectedCategory,     // ID выбранной категории
  onCategorySelect      // Callback (category) => void
}) => {
  const t = useTranslations('Categories');

  if (isLoading) {
    return <HomeCateLoader loading={isLoading} />;
  }

  if (isError) {
    return <ErrorMsg msg={t('loadingError') || 'Ошибка загрузки'} />;
  }

  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    
    <div className="tp-parent-categories mb-4 mt-4">
      <div className="d-flex flex-wrap gap-2 justify-content-center">
        {categories.map((category) => {
          const isSelected = selectedCategory === category.id;
          const hasChildren = category.children && category.children.length > 0;
          
          return (
            
            <button
              key={category.id}
              onClick={() => onCategorySelect(category)}
              className={`btn ${isSelected ? 'btn-primary' : 'btn-outline-primary'} btn-sm`}
              style={{
                borderRadius: '8px',
                borderColor: `var(--tp-theme-primary)`,
                backgroundColor: isSelected ? 'var(--tp-theme-primary)' : 'transparent',
                padding: '8px 20px',
                color: isSelected ? 'var(--tp-common-white)' : 'var(--tp-theme-primary)',
                fontWeight: isSelected ? '600' : '400',
                transition: 'all 0.3s ease'
              }}
            >
              {category.title}
              {hasChildren && <span className="ms-1" style={{ fontSize: '10px' }}>({category.children.length})</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ParentCategories;