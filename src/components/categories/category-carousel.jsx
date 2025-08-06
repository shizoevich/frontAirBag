'use client';
import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import Script from 'next/script';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation as SwiperNavigation, Grid as SwiperGrid } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/grid';
import 'swiper/css/navigation';
import ErrorMsg from '../common/error-msg';
import HomeCateLoader from '../loader/home/home-cate-loader';

// Fallback image URL для категорий, когда изображение не загружается
const FALLBACK_IMAGE = '/assets/img/category/noimage.png';

const CategoryCarousel = ({ 
  categories = [], 
  isLoading, 
  isError, 
  parentCategoryId, 
  selectedCategory, 
  onCategorySelect 
}) => {
  const navigationPrevRef = useRef(null);
  const navigationNextRef = useRef(null);
  const [mounted, setMounted] = useState(false);
  
  // Fix hydration mismatch by only rendering on client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle category selection
  const handleCategoryClick = (categoryId) => {
    onCategorySelect(categoryId === selectedCategory ? null : categoryId);
  };

  // Don't render anything during SSR to avoid hydration mismatch
  if (!mounted) {
    return null;
  }
  
  // Content
  let content = null;

  if (isLoading) {
    content = <HomeCateLoader loading={isLoading} />;
  }

  if (!isLoading && isError) {
    content = <ErrorMsg msg="Ошибка загрузки категорий" />;
  }

  if (!isLoading && !isError && (!categories || categories.length === 0)) {
    content = <ErrorMsg msg="Категории не найдены" />;
  }

  if (!isLoading && !isError && categories) {
    console.log('Структура данных категорий:', categories ? Object.keys(categories) : 'categories is null');
    console.log('Все категории:', categories?.results || []);
    
    // Получаем категории из правильного поля в зависимости от структуры данных
    let allCategories = [];
    if (categories?.results && Array.isArray(categories.results)) {
      allCategories = categories.results;
    } else if (Array.isArray(categories)) {
      allCategories = categories;
    }
    
    console.log('Все категории после обработки:', allCategories);
    console.log('Текущая родительская категория:', parentCategoryId);
    
    // Фильтруем только подкатегории выбранной родительской категории
    const subcategories = parentCategoryId 
      ? allCategories.filter(category => {
          // Проверяем, является ли категория подкатегорией выбранной родительской категории
          return category && category.title && category.title.trim() !== '' && 
                 category.parent_id && String(category.parent_id) === String(parentCategoryId);
        })
      : allCategories.filter(category => {
          // Если родительская категория не выбрана, показываем только марки автомобилей (parent_id === 754099)
          return category && category.title && category.title.trim() !== '' && 
                 category.parent_id && String(category.parent_id) === '754099';
        });
    
    // Add "All Categories" option для подкатегорий
    const allCategoriesOption = {
      id: 'all',
      title: 'Все подкатегории',
      image: 'noimage.png'
    };
    
    // Используем отфильтрованные подкатегории
    const displayCategories = parentCategoryId ? [allCategoriesOption, ...subcategories] : subcategories;
    
    // Create two slides with categories in a grid layout (two rows per slide)
    // Calculate how many categories to show per slide (2 rows x 5 columns = 10 per slide)
    const categoriesPerSlide = 10;
    const totalCategories = displayCategories.length;
    const slides = [];
    
    // Create slides with categories
    for (let i = 0; i < totalCategories; i += categoriesPerSlide) {
      const slideCategories = displayCategories.slice(i, i + categoriesPerSlide);
      slides.push(slideCategories);
    }
    
    // If we have less than 2 slides, add an empty one
    if (slides.length < 2) {
      slides.push([]);
    }
    
    content = (
      <Swiper
        modules={[SwiperNavigation, SwiperGrid]}
        spaceBetween={20}
        slidesPerView={5}
        grid={{
          rows: 2,
          fill: 'row'
        }}
        navigation={{
          prevEl: navigationPrevRef.current,
          nextEl: navigationNextRef.current,
        }}
        onBeforeInit={(swiper) => {
          swiper.params.navigation.prevEl = navigationPrevRef.current;
          swiper.params.navigation.nextEl = navigationNextRef.current;
        }}
        breakpoints={{
          1400: {
            slidesPerView: 5,
            grid: { rows: 2 }
          },
          1200: {
            slidesPerView: 4,
            grid: { rows: 2 }
          },
          992: {
            slidesPerView: 3,
            grid: { rows: 2 }
          },
          768: {
            slidesPerView: 3,
            grid: { rows: 2 }
          },
          576: {
            slidesPerView: 2,
            grid: { rows: 2 }
          },
          0: {
            slidesPerView: 1,
            grid: { rows: 2 }
          },
        }}
        className="category-carousel"
      >
        {displayCategories.map((category) => {
          const categoryId = category.id === 'all' ? null : (category.id_remonline || category.id);
          // Используем поле image из структуры данных категории
          let imageName = category.image || 'noimage.png';
          
          // Для опции "Все подкатегории" используем noimage.png
          if (category.id === 'all') {
            imageName = 'noimage.png';
          }
          
          console.log('Category:', category.title, 'Image:', imageName);
          
          // Добавляем проверку на соответствие имени файла изображения с предоставленным JSON
          // Если имя файла не соответствует ни одному из известных имен, используем noimage.png
          const knownImages = ['acura.jpg', 'audi.jpg', 'bmw.jpg', 'buick.jpg', 'cadillac.jpg', 
                            'chevrolet.jpg', 'dodge.jpg', 'fiat.jpg', 'ford.jpg', 'gmc.jpg', 
                            'honda.jpg', 'hundai.jpg', 'infinity.jpg', 'jaguar.jpg', 'jeep.jpg', 
                            'kia.jpg', 'land_rover.jpg', 'lexus.jpg', 'lincoln.jpg', 'mazda.jpg', 
                            'mercedes.jpg', 'mini_cooper.jpg', 'mitsubishi.jpg', 'mustang.jpg', 
                            'nissan.jpg', 'porsche.jpg', 'subaru.jpg', 'tesla.jpg', 'toyota.jpg', 
                            'volvo.jpg', 'vw.jpg', 'pp-nogi-sedenie.jpg', 'connektory.jpg', 'kreplenia.jpg',
                            'obmanki-rezistory.jpg', 'parashuty-meshki.jpg', 'capchasti-dlya-remnei.jpg',
                            'pp-v-remni.jpg', 'pp-v-shtory.jpg', 'pp-v-rul-1-zapal.jpg', 'pp-v-rul-2-zapal.jpg',
                            'pp-torpedo-1-zapal.jpg', 'pp-torpedo-2-zapal.jpg', 'noimage.png'];
          
          if (!knownImages.includes(imageName)) {
            console.log(`Изображение ${imageName} не найдено в списке известных изображений, используем noimage.png`);
            imageName = 'noimage.png';
          }
          
          const imagePath = `/assets/img/category/${imageName}`;
          
          return (
            <SwiperSlide key={category.id}>
              <div 
                className={`category-card text-center p-2 ${selectedCategory === categoryId ? 'active-category' : ''}`}
                onClick={() => handleCategoryClick(categoryId)}
                style={{
                  cursor: 'pointer',
                  border: selectedCategory === categoryId ? '2px solid #3577f0' : '1px solid #e9ecef',
                  borderRadius: '8px',
                  transition: 'all 0.3s ease',
                  height: '100%',
                  boxShadow: selectedCategory === categoryId ? '0 4px 10px rgba(53, 119, 240, 0.3)' : 'none'
                }}
              >
                <div className="category-img-wrapper" style={{ 
                  height: '90px', 
                  overflow: 'hidden', 
                  marginBottom: '8px', 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center' 
                }}>
                  <Image 
                    src={imagePath}
                    width={80} 
                    height={80} 
                    alt={category.title}
                    style={{ objectFit: 'contain' }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = FALLBACK_IMAGE;
                      console.log('Image failed to load:', imagePath, 'Using fallback');
                    }}
                    priority={true}
                    unoptimized={true}
                  />
                </div>
                <h5 className="category-title" style={{ 
                  fontSize: '14px', 
                  fontWeight: selectedCategory === categoryId ? 'bold' : 'normal',
                  margin: '0',
                  padding: '0'
                }}>
                  {category.title}
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
      {/* Add Swiper scripts dynamically */}
      <Script src="https://cdn.jsdelivr.net/npm/swiper@10/swiper-bundle.min.js" strategy="afterInteractive" />
      
      <div className="category-carousel-wrapper position-relative">
        {content}
        <div className="category-carousel-navigation">
          <button 
            ref={navigationPrevRef} 
            className="category-carousel-prev"
            style={{
              position: 'absolute',
              top: '50%',
              left: '-15px',
              transform: 'translateY(-50%)',
              zIndex: 10,
              background: '#fff',
              border: '1px solid #e9ecef',
              borderRadius: '50%',
              width: '30px',
              height: '30px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
            }}
          >
            <i className="fa-solid fa-chevron-left"></i>
          </button>
          <button 
            ref={navigationNextRef} 
            className="category-carousel-next"
            style={{
              position: 'absolute',
              top: '50%',
              right: '-15px',
              transform: 'translateY(-50%)',
              zIndex: 10,
              background: '#fff',
              border: '1px solid #e9ecef',
              borderRadius: '50%',
              width: '30px',
              height: '30px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
            }}
          >
            <i className="fa-solid fa-chevron-right"></i>
          </button>
        </div>
      </div>
      <style jsx global>{`
        .category-carousel .swiper-grid-column .swiper-wrapper {
          flex-direction: row;
        }
        .category-carousel .swiper-slide {
          height: auto;
          margin-bottom: 20px;
        }
        .category-carousel .swiper-grid-column .swiper-slide {
          height: calc((100% - 20px) / 2) !important;
        }
      `}</style>
    </div>
  );
};

export default CategoryCarousel;
