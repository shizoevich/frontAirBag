'use client';
import { useState, useMemo } from 'react';
import Image from 'next/image';
import PopupVideo from '../common/popup-video';

const DetailsWrapper = ({
  imageURLs = [],
  handleImageActive = () => {},
  activeImg = '',
  imgWidth = 416,
  imgHeight = 480,
  videoId = false,
  status = ''
}) => {
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const defaultImage = '/assets/img/product/3/product-1.jpg'; // Используем существующее изображение как заглушку

  // Безопасная обработка изображений
  const normalizedImages = useMemo(() => {
    try {
      if (!Array.isArray(imageURLs)) return [];
      return imageURLs
        .filter(item => item?.img && typeof item.img === 'string')
        .map(item => ({
          ...item,
          img: item.img.trim() || defaultImage
        }));
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
    <div className="tp-product-details-thumb-wrapper tp-tab d-sm-flex">
      {/* Миниатюры */}
      {normalizedImages.length > 0 && (
        <nav>
          <div className="nav nav-tabs flex-sm-column">
            {normalizedImages.map((item, i) => (
              <button
                key={`thumb-${i}`}
                className={`nav-link ${item.img === safeActiveImg ? 'active' : ''}`}
                onClick={() => handleSafeClick(item)}
              >
                <Image
                  src={item.img}
                  alt={`Thumbnail ${i + 1}`}
                  width={78}
                  height={100}
                  style={{ width: '100%', height: '100%' }}
                  onError={(e) => {
                    e.currentTarget.src = defaultImage;
                  }}
                />
              </button>
            ))}
          </div>
        </nav>
      )}

      {/* Основное изображение */}
      <div className="tab-content m-img">
        <div className="tab-pane fade show active">
          <div className="tp-product-details-nav-main-thumb p-relative">
            <Image
              src={safeActiveImg}
              alt="Product main image"
              width={imgWidth}
              height={imgHeight}
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
        </div>
      </div>

      {/* Попап видео */}
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

export default DetailsWrapper;