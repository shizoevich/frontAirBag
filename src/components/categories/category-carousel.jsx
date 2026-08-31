'use client';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation as SwiperNavigation, Grid as SwiperGrid } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/grid';
import 'swiper/css/navigation';
import ErrorMsg from '../common/error-msg';
import HomeCateLoader from '../loader/home/home-cate-loader';
import { useTranslations } from 'next-intl';

import { categoryImage, FALLBACK_CATEGORY_IMAGE as FALLBACK_IMAGE } from '@/utils/category-image';

// Единственный источник правды по раскладке: и Swiper, и перестановка ниже
// считают по нему. Порядок — от широкого экрана к узкому.
const LAYOUT_BREAKPOINTS = [
  { minWidth: 1400, slidesPerView: 6, rows: 2 },
  { minWidth: 1200, slidesPerView: 5, rows: 2 },
  { minWidth: 992, slidesPerView: 4, rows: 2 },
  { minWidth: 0, slidesPerView: 4, rows: 1 },
];

const SWIPER_BREAKPOINTS = Object.fromEntries(
  LAYOUT_BREAKPOINTS.map(({ minWidth, slidesPerView, rows }) => [
    minWidth,
    { slidesPerView, grid: { rows } },
  ])
);

function activeLayout(width) {
  return LAYOUT_BREAKPOINTS.find((b) => width >= b.minWidth) ?? LAYOUT_BREAKPOINTS.at(-1);
}

/**
 * Сколько рядов Swiper построит на самом деле.
 *
 * Измерено на живой странице: при `grid.rows = 2` Swiper раскладывает слайды в
 * два ряда только если их больше, чем помещается в видимую часть. Список из
 * шести категорий при slidesPerView=6 он выстраивает в одну строку — и
 * перестановка под две строки в таком случае просто перемешивает алфавит.
 */
export function effectiveRows(count, { slidesPerView, rows }) {
  return rows === 2 && count > slidesPerView ? 2 : 1;
}

/**
 * Порядок слайдов для сетки из двух рядов.
 *
 * Swiper с `fill: 'row'` заполняет сначала весь верхний ряд, потом нижний, а
 * читать список нужно колонками — сверху вниз, затем вправо. Поэтому массив
 * транспонируется. Для одного ряда транспонировать нечего: раньше это делали
 * безусловно, и на телефоне выходило «сначала верхний ряд, следом нижний» —
 * алфавит начинался заново с середины.
 */
export function orderForGrid(categories, rows) {
  if (!Array.isArray(categories) || categories.length === 0) return [];
  if (rows < 2) return categories;

  const cols = Math.ceil(categories.length / rows);
  const result = [];
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const index = row + col * rows;
      if (index < categories.length) result.push(categories[index]);
    }
  }
  return result;
}

const CategoryCarousel = ({ 
  categories = [],      // Массив категорий для отображения
  isLoading, 
  isError, 
  selectedCategory,     // ID выбранной категории
  onCategorySelect,     // Callback (category) => void
  level = 0             // Уровень вложенности (для стилизации)
}) => {
  const t = useTranslations('Categories');
  const navigationPrevRef = useRef(null);
  const navigationNextRef = useRef(null);

  // Ширина окна нужна, чтобы знать, сколько рядов построит Swiper. На сервере
  // её нет, поэтому стартуем с самой широкой раскладки и уточняем после
  // монтирования — до первого кадра в браузере.
  const [viewportWidth, setViewportWidth] = useState(LAYOUT_BREAKPOINTS[0].minWidth);

  useEffect(() => {
    const update = () => setViewportWidth(window.innerWidth);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const sortedCategories = useMemo(
    () => orderForGrid(categories, effectiveRows(categories.length, activeLayout(viewportWidth))),
    [categories, viewportWidth]
  );

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
    <div className="category-carousel-container">
      <div className="category-carousel-wrapper position-relative">
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
          breakpoints={SWIPER_BREAKPOINTS}
          className="category-carousel"
        >
          {sortedCategories.map((category) => {
            const categoryId = category.id;
            const categoryName = category.title || '';
            const isSelected = selectedCategory === categoryId;
            const hasSubcategories = category.children && category.children.length > 0;
            
            const imagePath = categoryImage(category);

            return (
              <SwiperSlide key={category.id}>
                <div 
                  className={`category-card text-center p-2 ${isSelected ? 'active-category' : ''}`}
                  onClick={() => onCategorySelect(category)}
                  style={{
                    cursor: 'pointer',
                    border: isSelected ? '2px solid #de8043' : '1px solid #e9ecef',
                    borderRadius: '8px',
                    transition: 'all 0.3s ease',
                    height: '100%',
                    boxShadow: isSelected ? '0 4px 10px rgba(222, 128, 67, 0.3)' : 'none'
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
                  <h5 className="category-title" style={{ 
                    fontSize: '14px', 
                    fontWeight: isSelected ? 'bold' : 'normal', 
                    margin: '0',
                    color: isSelected ? '#de8043' : 'inherit'
                  }}>
                    {categoryName}
                    {hasSubcategories && <span className="ms-1" style={{ fontSize: '10px' }}>▼</span>}
                  </h5>
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>
        
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
      `}</style>
    </div>
  );
};

export default CategoryCarousel;