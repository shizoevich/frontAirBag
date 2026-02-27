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
    
    <div className="tp-parent-categories mb-4">
      <div className="d-flex flex-wrap gap-2 justify-content-center">
        {categories.map((category) => {
          const isSelected = selectedCategory === category.id;
          const hasChildren = category.children && category.children.length > 0;
          
          return (
            
            <button
              key={category.id}
              onClick={() => onCategorySelect(category)}
              className={`category-btn ${isSelected ? 'selected' : ''}`}
              style={{
                position: 'relative',
                borderRadius: '12px',
                border: 'none',
                padding: '14px 28px',
                fontSize: '24px',
                fontWeight: isSelected ? '800' : '700',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                background: isSelected 
                  ? 'linear-gradient(135deg,rgb(245, 184, 51) 0%,rgb(222, 128, 67) 100%)'
                  : 'linear-gradient(135deg, rgba(250, 196, 115, 0.9) 0%, rgba(247, 97, 11, 0.83) 100%)',
                color: isSelected ? '#2d3748' : '#2d3748',
                boxShadow: isSelected 
                  ? '0 8px 25px rgba(102, 126, 234, 0.3), 0 4px 10px rgba(0,0,0,0.1)'
                  : '0 4px 15px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.04)',
                transform: isSelected ? 'translateY(-2px)' : 'translateY(0)',
                backdropFilter: 'blur(10px)',
                border: '1.5px solid rgba(255,255,255,0.2)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                minHeight: '44px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}

              
            >
              
              {/* Название категории */}
              <span style={{
                fontSize: '18px',
                fontWeight: isSelected ? '700' : '600'
              }}>
                {category.title}
              </span>
              
              {/* Hover эффект */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: isSelected 
                  ? 'linear-gradient(135deg, rgba(204, 113, 29, 0.1) 0%, rgba(209, 26, 26, 0.05) 10%)'
                  : 'linear-gradient(135deg, rgba(227, 92, 8, 0.05) 0%, rgba(216, 73, 7, 0.05) 10%)',
                borderRadius: '12px',
                opacity: 0,
                transition: 'opacity 0.3s ease',
                pointerEvents: 'none'
              }}
              className="category-btn-overlay"
              />
            </button>


          );
        })}
      </div>
    </div>
  );
};

export default ParentCategories;