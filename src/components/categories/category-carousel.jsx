'use client';
import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation as SwiperNavigation, Grid as SwiperGrid } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/grid';
import 'swiper/css/navigation';
import ErrorMsg from '../common/error-msg';
import HomeCateLoader from '../loader/home/home-cate-loader';
import { useTranslations } from 'next-intl';

// Fallback image URL для категорий, когда изображение не загружается
const FALLBACK_IMAGE = '/assets/img/category/noimage.png';

const CategoryCarousel = ({ 
  categories, 
  isLoading, 
  isError, 
  parentCategoryId, 
  selectedCategory, 
  onCategorySelect 
}) => {
  const t = useTranslations('Categories');
  const navigationPrevRef = useRef(null);
  const navigationNextRef = useRef(null);

  let content = null;

  if (isLoading) {
    content = <HomeCateLoader loading={isLoading} />;
  } else if (isError) {
    content = <ErrorMsg msg={t('loadingError')} />;
  } else if (!categories || categories.length === 0) {
    content = <ErrorMsg msg={t('noCategoriesFound')} />;
  } else {
    const displayCategories = parentCategoryId
      ? categories.filter(cat => cat.parent_id === parentCategoryId)
      : categories;

    if (displayCategories.length === 0) {
      return <div className="text-center p-4">{t('noSubcategories')}</div>;
    }

    // Сортируем категории: английский, кириллица, цифры
    const alphabeticallySorted = [...displayCategories].sort((a, b) => {
      const titleA = (a.title || '').trim();
      const titleB = (b.title || '').trim();
      
      // Определяем тип первого символа
      const getCharType = (str) => {
        const firstChar = str.charAt(0);
        if (/\d/.test(firstChar)) return 3; // Цифры
        if (/[а-яА-ЯіІїЇєЄґҐ]/.test(firstChar)) return 2; // Кириллица
        if (/[a-zA-Z]/.test(firstChar)) return 1; // Английский
        return 4; // Остальное
      };
      
      const typeA = getCharType(titleA);
      const typeB = getCharType(titleB);
      
      // Сначала сортируем по типу символа
      if (typeA !== typeB) return typeA - typeB;
      
      // Внутри одного типа - по алфавиту
      return titleA.toLowerCase().localeCompare(titleB.toLowerCase(), typeA === 2 ? 'uk' : 'en');
    });

    // Пересортировываем для вертикального отображения (по колонкам)
    const rows = 2;
    const cols = Math.ceil(alphabeticallySorted.length / rows);
    const sortedCategories = [];
    
    // Заполняем массив по строкам, но берем элементы по колонкам
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const index = row + col * rows;
        if (index < alphabeticallySorted.length) {
          sortedCategories.push(alphabeticallySorted[index]);
        }
      }
    }

    content = (
      <Swiper
        modules={[SwiperNavigation, SwiperGrid]}
        spaceBetween={20}
        slidesPerView={5}
        grid={{ rows: 2, fill: 'row' }}
        navigation={{
          prevEl: navigationPrevRef.current,
          nextEl: navigationNextRef.current,
        }}
        onBeforeInit={(swiper) => {
          swiper.params.navigation.prevEl = navigationPrevRef.current;
          swiper.params.navigation.nextEl = navigationNextRef.current;
        }}
        breakpoints={{
          1400: { slidesPerView: 6, grid: { rows: 2 } },
          1200: { slidesPerView: 5, grid: { rows: 2 } },
          992: { slidesPerView: 4, grid: { rows: 2 } },
          768: { slidesPerView: 4, grid: { rows: 1 } },
          576: { slidesPerView: 4, grid: { rows: 1 } },
          0: { slidesPerView: 4, grid: { rows: 1 } },
        }}
        className="category-carousel"
      >
        {sortedCategories.map((category) => {
          const categoryId = Number(category.id);
          const categoryName = category.title || '';
          const imagePath = category.image?.startsWith('http') ? category.image : `/assets/img/category/${category.image || 'noimage.png'}`;

          return (
            <SwiperSlide key={category.id}>
              <div 
                className={`category-card text-center p-2 ${selectedCategory === categoryId ? 'active-category' : ''}`}
                onClick={() => onCategorySelect(category)}
                style={{
                  cursor: 'pointer',
                  border: selectedCategory === categoryId ? '2px solid #de8043' : '1px solid #e9ecef',
                  borderRadius: '8px',
                  transition: 'all 0.3s ease',
                  height: '100%',
                  boxShadow: selectedCategory === categoryId ? '0 4px 10px rgba(222, 128, 67, 0.3)' : 'none'
                }}
              >
                <div className="category-img-wrapper" style={{ height: '90px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <Image 
                    src={imagePath}
                    width={80} 
                    height={80} 
                    alt={categoryName}
                    style={{ objectFit: 'contain' }}
                    onError={(e) => { e.target.src = FALLBACK_IMAGE; }}
                    priority
                    unoptimized
                  />
                </div>
                <h5 className="category-title" style={{ fontSize: '14px', fontWeight: selectedCategory === categoryId ? 'bold' : 'normal', margin: '0' }}>
                  {categoryName}
                </h5>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
    );
  }

  return (
    <div className="category-carousel-container">
      <div className="category-carousel-wrapper position-relative">
        {content}
        <div className="category-carousel-navigation">
          <button ref={navigationPrevRef} className="category-carousel-prev" style={{ position: 'absolute', top: '50%', left: '-15px', transform: 'translateY(-50%)', zIndex: 10, background: '#fff', border: '1px solid #e9ecef', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
            <i className="fa-solid fa-chevron-left"></i>
          </button>
          <button ref={navigationNextRef} className="category-carousel-next" style={{ position: 'absolute', top: '50%', right: '-15px', transform: 'translateY(-50%)', zIndex: 10, background: '#fff', border: '1px solid #e9ecef', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
            <i className="fa-solid fa-chevron-right"></i>
          </button>
        </div>
      </div>
      <style jsx global>{`
        .category-carousel .swiper-grid-column .swiper-wrapper { flex-direction: row; }
        .category-carousel .swiper-slide { height: auto; margin-bottom: 20px; }
        .category-carousel .swiper-grid-column .swiper-slide { height: calc((100% - 20px) / 2) !important; }
      `}</style>
    </div>
  );
};

export default CategoryCarousel;