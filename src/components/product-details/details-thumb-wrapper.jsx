'use client';
import { useState, useMemo, useRef } from 'react';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Thumbs, FreeMode } from 'swiper/modules';
import PopupVideo from '../common/popup-video';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/thumbs';
import 'swiper/css/free-mode';
import './product-slider-fix.css';

const DetailsThumbWrapper = ({
  product,
  activeImg,
  handleImageActive,
  imageURLs = [],
  imgWidth = 416,
  imgHeight = 480,
  videoId = false,
  status = ''
}) => {
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const mainSwiperRef = useRef(null);
  const defaultImage = 'https://t3.ftcdn.net/jpg/04/34/72/82/360_F_434728286_OWQQvAFoXZLdGHlObozsolNeuSxhpr84.jpg'; // Используем стандартную заглушку для всего сайта

  // Безопасная обработка изображений
  const normalizedImages = useMemo(() => {
    try {
      if (!Array.isArray(imageURLs)) {
        return [];
      }
      
      const filtered = imageURLs.filter(item => {
        // Поддерживаем как объекты {img: "url"}, так и простые строки
        if (typeof item === 'string') {
          return item.trim().length > 0;
        }
        return item?.img && typeof item.img === 'string';
      });
      
      const normalized = filtered.map(item => {
        // Нормализуем в единый формат {img: "url"}
        if (typeof item === 'string') {
          return { img: item.trim() || defaultImage };
        }
        return {
          ...item,
          img: item.img.trim() || defaultImage
        };
      });
      
      return normalized;
    } catch (error) {
      console.error('Error normalizing images:', error);
      return [];
    }
  }, [imageURLs]);

  // Безопасное активное изображение
  const safeActiveImg = useMemo(() => {
    try {
      if (typeof activeImg === 'string' && activeImg.trim()) {
        return activeImg.trim();
      }
      return normalizedImages[0]?.img || defaultImage;
    } catch (error) {
      console.error('Error determining active image:', error);
      return defaultImage;
    }
  }, [activeImg, normalizedImages]);

  // Обработчик клика с защитой
  const handleSafeClick = (item) => {
    try {
      if (item?.img) {
        handleImageActive(item);
      }
    } catch (error) {
      console.error('Error handling image click:', error);
    }
  };

  // Проверка наличия видео
  const hasVideo = Boolean(videoId);

  return (
    <div className="tp-product-details-thumb-wrapper">
      {/* Основной слайдер изображений */}
      <div className="tp-product-details-main-slider">
        {normalizedImages.length <= 1 ? (
          // Если только одно изображение или нет, показываем без слайдера
          <div className="tp-product-details-nav-main-thumb p-relative">
            <Image
              src={normalizedImages[0]?.img || defaultImage}
              alt="Product image"
              width={0}
              height={0}
              sizes="100vw"
              style={{
                width: '100%',
                height: 'auto',
                maxWidth: '100%',
                maxHeight: '550px',
                objectFit: 'contain',
                display: 'block',
                margin: '0 auto'
              }}
              onError={(e) => {
                e.currentTarget.src = defaultImage;
              }}
            />

            {/* Бейдж статуса */}
            {status === 'out-of-stock' && (
              <div className="tp-product-badge">
                <span className="product-hot">out-stock</span>
              </div>
            )}

            {/* Кнопка видео */}
            {hasVideo && (
              <div
                onClick={() => setIsVideoOpen(true)}
                className="tp-product-details-thumb-video"
              >
                <button className="tp-product-details-thumb-video-btn popup-video">
                  <i className="fas fa-play"></i>
                </button>
              </div>
            )}
          </div>
        ) : (
          // Если несколько изображений, используем слайдер
          <Swiper
            ref={mainSwiperRef}
            spaceBetween={10}
            navigation={{
              nextEl: '.tp-product-details-nav-next',
              prevEl: '.tp-product-details-nav-prev',
            }}
            modules={[Navigation]}
            className="product-main-swiper"
          >
            {normalizedImages.map((item, i) => (
              <SwiperSlide key={`main-${i}`}>
                <div className="tp-product-details-nav-main-thumb p-relative">
                  <Image
                    src={item.img || defaultImage}
                    alt={`Product image ${i + 1}`}
                    width={0}
                    height={0}
                    sizes="100vw"
                    style={{
                      width: '100%',
                      height: 'auto',
                      maxWidth: '100%',
                      maxHeight: '550px',
                      objectFit: 'contain',
                      display: 'block',
                      margin: '0 auto'
                    }}
                    onError={(e) => {
                      e.currentTarget.src = defaultImage;
                    }}
                  />

                  {/* Бейдж статуса */}
                  {status === 'out-of-stock' && i === 0 && (
                    <div className="tp-product-badge">
                      <span className="product-hot">out-stock</span>
                    </div>
                  )}

                  {/* Кнопка видео */}
                  {hasVideo && i === 0 && (
                    <div
                      onClick={() => setIsVideoOpen(true)}
                      className="tp-product-details-thumb-video"
                    >
                      <button className="tp-product-details-thumb-video-btn popup-video">
                        <i className="fas fa-play"></i>
                      </button>
                    </div>
                  )}
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </div>

      {/* Навигационные стрелки */}
      <div className="tp-product-details-nav-btns">
        <div className="tp-product-details-nav-prev">
          <i className="fa-solid fa-angle-left"></i>
        </div>
        <div className="tp-product-details-nav-next">
          <i className="fa-solid fa-angle-right"></i>
        </div>
      </div>

      {/* Video popup */}
      {hasVideo && (
        <PopupVideo
          isVideoOpen={isVideoOpen}
          setIsVideoOpen={setIsVideoOpen}
          videoId={videoId}
        />
      )}
    </div>
  );
};

export default DetailsThumbWrapper;