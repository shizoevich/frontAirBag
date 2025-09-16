'use client';
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useLocale } from 'next-intl';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
// internal
import { useGetShowCategoryQuery } from "@/redux/features/categoryApi";
import ErrorMsg from "@/components/common/error-msg";
import Loader from "@/components/loader/loader";
import { getProductImage } from "@/utils/image-utils";

const MobileCatalogSlider = ({ setIsCanvasOpen }) => {
  const { data: categories, isError, isLoading } = useGetShowCategoryQuery();
  const [slidesPerView, setSlidesPerView] = useState(4);
  const router = useRouter();
  const locale = useLocale();

  // Отслеживаем размер экрана для адаптивного количества слайдов
  useEffect(() => {
    const updateSlidesPerView = () => {
      const width = window.innerWidth;
      if (width < 380) {
        setSlidesPerView(4); // Минимум 4 на очень маленьких экранах
      } else if (width < 480) {
        setSlidesPerView(4); // 4 на маленьких экранах
      } else if (width < 768) {
        setSlidesPerView(4); // 4 на средних мобильных
      } else {
        setSlidesPerView(5); // 5 на больших мобильных
      }
    };

    updateSlidesPerView();
    window.addEventListener('resize', updateSlidesPerView);
    return () => window.removeEventListener('resize', updateSlidesPerView);
  }, []);

  const handleCategoryRoute = (categoryId, title, type = "parent") => {
    if (type === "parent") {
      router.push(`/${locale}/shop?categoryId=${categoryId}`);
    } else {
      router.push(`/${locale}/shop?categoryId=${categoryId}`);
    }
    if (setIsCanvasOpen) {
      setIsCanvasOpen(false);
    }
  };

  const [expandedCategory, setExpandedCategory] = useState(null);

  const toggleCategory = (categoryId) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  let content = null;

  if (isLoading) {
    content = (
      <div className="py-3 text-center">
        <Loader loading={isLoading} />
      </div>
    );
  }

  if (!isLoading && isError) {
    content = <ErrorMsg msg="There was an error loading categories" />;
  }

  if (!isLoading && !isError && categories?.length === 0) {
    content = <ErrorMsg msg="No categories found!" />;
  }

  if (!isLoading && !isError && categories?.length > 0) {
    content = (
      <div className="mobile-catalog-list">
        {categories.map((item) => {
          const categoryId = item.id_remonline || item.id;
          const categoryImage = item.img || `/assets/img/category/${item.title.toLowerCase().replace(/\s+/g, '-')}.jpg`;
          const isExpanded = expandedCategory === categoryId;
          
          return (
            <div key={categoryId} className="mobile-catalog-category">
              <div 
                className="mobile-catalog-item"
                onClick={() => {
                  if (item.children?.length > 0) {
                    toggleCategory(categoryId);
                  } else {
                    handleCategoryRoute(categoryId, item.title, "parent");
                  }
                }}
              >
                <div className="mobile-catalog-image">
                  <Image 
                    src={getProductImage(categoryImage)} 
                    alt={item.title} 
                    width={40} 
                    height={40}
                    style={{
                      objectFit: 'cover',
                      borderRadius: '6px'
                    }}
                  />
                </div>
                <div className="mobile-catalog-title">
                  {item.title}
                </div>
                {item.children?.length > 0 && (
                  <div className={`mobile-catalog-arrow ${isExpanded ? 'expanded' : ''}`}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                )}
              </div>
              
              {item.children?.length > 0 && isExpanded && (
                <div className="mobile-catalog-submenu">
                  {item.children.map((child) => {
                    const childId = child.id_remonline || child.id;
                    return (
                      <div
                        key={childId}
                        className="mobile-catalog-subitem"
                        onClick={() => handleCategoryRoute(childId, child.title, "child")}
                      >
                        {child.title}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="mobile-catalog-slider">
      <div className="mobile-catalog-content">
        {content}
      </div>
    </div>
  );
};

export default MobileCatalogSlider;
