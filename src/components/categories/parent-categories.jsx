'use client';
import React from 'react';
import ErrorMsg from '@/components/common/error-msg';
import HomeCateLoader from '../loader/home/home-cate-loader';

const ParentCategories = ({ 
  categories = [], 
  isLoading, 
  isError, 
  selectedParentCategory, 
  onParentCategorySelect 
}) => {
  // Находим родительские категории по ID (Covers, Комплектующие Airbag SRS, Пиропатроны)
  const parentCategoryIds = [754099, 754100, 754101]; // ID родительских категорий
  
  console.log('All categories in parent-categories.jsx:', categories);
  
  // Преобразуем ID в строки для более надежного сравнения
  const parentCategoryIdsStr = parentCategoryIds.map(id => String(id));
  
  // Добавляем жестко закодированные родительские категории, если их нет в данных
  let parentCategories = categories.filter(cat => {
    if (!cat) return false;
    const catId = String(cat.id || '');
    const isParent = parentCategoryIdsStr.includes(catId);
    console.log(`Category ${cat.title || 'unknown'} (ID: ${catId}) is parent: ${isParent}`);
    return isParent;
  });
  
  // Если родительские категории не найдены, создаем их вручную
  if (parentCategories.length === 0) {
    console.log('Родительские категории не найдены, создаем вручную');
    parentCategories = [
      { id: 754099, title: "Covers", image: "noimage.png" },
      { id: 754100, title: "Комплектующие Airbag SRS", image: "noimage.png" },
      { id: 754101, title: "Пиропатроны", image: "noimage.png" }
    ];
  }
  
  // Добавляем опцию "Все категории"
  const allCategoriesOption = {
    id: 'all',
    title: 'Все категории',
    parent_id: null
  };
  
  const displayCategories = [allCategoriesOption, ...parentCategories];
  
  let content = null;
  
  if (isLoading) {
    content = <HomeCateLoader loading={isLoading} />;
  }
  
  if (!isLoading && isError) {
    content = <ErrorMsg msg="Ошибка загрузки категорий" />;
  }
  
  if (!isLoading && !isError && (!displayCategories || displayCategories.length === 0)) {
    content = <ErrorMsg msg="Категории не найдены" />;
  }
  
  if (!isLoading && !isError && displayCategories && displayCategories.length > 0) {
    content = (
      <div className="parent-categories-wrapper">
        <div className="parent-categories-list d-flex flex-wrap">
          {displayCategories.map((category) => {
            const categoryId = category.id === 'all' ? null : (category.id_remonline || category.id);
            const isActive = selectedParentCategory === categoryId;
            
            return (
              <div 
                key={category.id} 
                className={`parent-category-item ${isActive ? 'active' : ''}`}
                onClick={() => onParentCategorySelect(categoryId)}
              >
                <div 
                  className="parent-category-btn"
                  style={{
                    padding: '8px 16px',
                    margin: '0 8px 8px 0',
                    cursor: 'pointer',
                    borderRadius: '4px',
                    backgroundColor: isActive ? '#3577f0' : '#f0f2f5',
                    color: isActive ? 'white' : '#333',
                    fontWeight: isActive ? 'bold' : 'normal',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {category.title}
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
      <h2 className="mb-3">Выберите категорию</h2>
      
      {content}
      
    </div>
  );
};

export default ParentCategories;