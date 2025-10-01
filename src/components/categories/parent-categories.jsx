'use client';
import React from 'react';
import { useTranslations } from 'next-intl';
import ErrorMsg from '@/components/common/error-msg';
import HomeCateLoader from '../loader/home/home-cate-loader';

const ParentCategories = ({ 
  categories = [], 
  isLoading, 
  isError, 
  selectedParentCategory, 
  onParentCategorySelect 
}) => {
  const t = useTranslations('ParentCategories');
  
  // These are the IDs of the main categories you want to display
  const parentCategoryIds = [754099, 754100, 754101];

  // Filter and sort the parent categories
  let parentCategories = categories
    .filter(cat => parentCategoryIds.includes(Number(cat.id)))
    .sort((a, b) => parentCategoryIds.indexOf(Number(a.id)) - parentCategoryIds.indexOf(Number(b.id)));

  // If parent categories are not found in the API, create fallback categories
  if (parentCategories.length === 0) {
    parentCategories = [
      { id: 754099, id_remonline: 754099, title: t('covers') || 'Covers', parent_id: null },
      { id: 754100, id_remonline: 754100, title: t('airbag_components') || 'Airbag Components', parent_id: null },
      { id: 754101, id_remonline: 754101, title: t('squibs') || 'Pyrotechnics', parent_id: null }
    ];
  }

  // Use parent categories directly without "All Categories" option
  const displayCategories = parentCategories;

  let content = null;

  if (isLoading) {
    content = <HomeCateLoader loading={isLoading} />;
  } else if (isError) {
    content = <ErrorMsg msg={t('loadingError')} />;
  } else {
    content = (
      <div className="parent-categories-list d-flex flex-wrap">
        {displayCategories.map((category) => {
          const categoryId = category.id === 'all' ? null : Number(category.id);
          const isActive = selectedParentCategory === categoryId;
          
          return (
            <div 
              key={category.id} 
              className={`parent-category-item ${isActive ? 'active' : ''}`}
              onClick={() => onParentCategorySelect(category)}
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
          );
        })}
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