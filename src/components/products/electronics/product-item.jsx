'use client';
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { useTranslations, useLocale } from 'next-intl';
import { useLocalizedLink } from '@/utils/localeLink';
// internal
import { Cart, QuickView } from "@/svg";
import { handleProductModal } from "@/redux/features/productModalSlice";
import { add_cart_product, setCartQuantity } from "@/redux/features/cartSlice";
import QuantityInput from "@/components/common/quantity-input";
import BlurImage from "@/components/common/BlurImage";
import { getProductImage } from "@/utils/image-utils";
import { slugify } from '@/utils/slugify';

const ProductItem = ({ product }) => {
  const t = useTranslations('ProductItem');
  const locale = useLocale();
  const getLocalizedLink = useLocalizedLink();
  const [isClient, setIsClient] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  // Какое фото показано на телефоне. На десктопе картинку выбирает наведение.
  const [photoIndex, setPhotoIndex] = useState(0);
  const touchStart = useRef(null);
  // Свайп и тап приходят одним жестом; флаг отличает одно от другого, чтобы
  // листание фото не открывало карточку.
  const swiped = useRef(false);
  const { cart_products } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  
  const { id, category, title, price_minor, images, residue, imageURLs } = product || {};

  useEffect(() => {
    setIsClient(true);
    // Проверяем, является ли устройство десктопным (не touch)
    const checkIfDesktop = () => {
      const isLargeScreen = window.innerWidth > 768;
      // Используем более мягкую логику: hover работает на больших экранах независимо от touch
      const isDesktopDevice = isLargeScreen;
      
      setIsDesktop(isDesktopDevice);
    };
    
    checkIfDesktop();
    window.addEventListener('resize', checkIfDesktop);
    
    return () => window.removeEventListener('resize', checkIfDesktop);
  }, []);

  if (!isClient) {
    return <div className="tp-product-item mb-25" />; // Скелетон для SSR
  }

  const isAddedToCart = cart_products.some((prd) => {
    const prdId = prd.id || prd._id;
    const currentId = id || product._id;
    return prdId === currentId;
  });

  const cartItem = cart_products.find((prd) => {
    const prdId = prd.id || prd._id;
    const currentId = id || product._id;
    return prdId === currentId;
  });

  const currentOrderQuantity = Number(cartItem?.orderQuantity || 1);
 
  const normalizedResidue = Number(residue ?? 0);
  const isOutOfStock = normalizedResidue <= 0;

  // handle add product
  const handleAddProduct = (prd) => {
    dispatch(add_cart_product(prd));
  };

  const handleQuantityChange = (quantity) => {
    if (cartItem) {
      dispatch(setCartQuantity({ id: cartItem.id || cartItem._id, quantity }));
    }
  };

// Все фотографии товара по порядку. Раньше отсюда брали только вторую — для
// наведения; теперь по ним же листают свайпом, поэтому нужен весь список.
const getGallery = () => {
  const fromImages = Array.isArray(product?.images) ? product.images : [];
  const urls = fromImages
    .map((item) => (typeof item === 'string' ? item : item?.url || item?.img || item?.src))
    .filter(Boolean);

  if (urls.length > 0) return urls;

  // Запасной вариант - проверяем imageURLs
  if (Array.isArray(product?.imageURLs) && product.imageURLs.length > 0) {
    return product.imageURLs.filter(Boolean);
  }

  return [getProductImage(product)];
};

const gallery = getGallery();
const hasGallery = gallery.length > 1;

// На десктопе наведение показывает второе фото — как было. На телефоне картинку
// выбирает свайп. Одна общая величина, чтобы полоски всегда показывали то же,
// что видно на экране.
const shownIndex = hasGallery && isDesktop && isHovered ? 1 : photoIndex;
const shownImage = gallery[shownIndex] || gallery[0];

const handleMouseEnter = () => {
  setIsHovered(true);
};

const handleMouseLeave = () => {
  setIsHovered(false);
};

// Свайп — только на телефоне. Карусель кольцевая: листать в одну сторону можно
// сколько угодно.
const SWIPE_THRESHOLD = 40;

const handleTouchStart = (event) => {
  if (!hasGallery) return;
  const touch = event.touches[0];
  touchStart.current = { x: touch.clientX, y: touch.clientY };
  swiped.current = false;
};

const handleTouchMove = (event) => {
  if (!hasGallery || !touchStart.current) return;
  const touch = event.touches[0];
  const dx = touch.clientX - touchStart.current.x;
  const dy = touch.clientY - touchStart.current.y;

  // Горизонтальное движение — листаем. Вертикальное не трогаем: это прокрутка
  // страницы, и перехватывать её нельзя.
  if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > SWIPE_THRESHOLD) {
    swiped.current = true;
  }
};

const handleTouchEnd = (event) => {
  if (!hasGallery || !touchStart.current) return;
  const touch = event.changedTouches[0];
  const dx = touch.clientX - touchStart.current.x;
  const dy = touch.clientY - touchStart.current.y;
  touchStart.current = null;

  if (Math.abs(dx) <= Math.abs(dy) || Math.abs(dx) < SWIPE_THRESHOLD) {
    swiped.current = false;
    return;
  }

  swiped.current = true;
  const step = dx < 0 ? 1 : -1;
  setPhotoIndex((current) => (current + step + gallery.length) % gallery.length);
};

// Тап открывает карточку, свайп — нет. Без этого палец, листающий фото,
// каждый раз уводил бы со страницы.
const handleClick = (event) => {
  if (swiped.current) {
    event.preventDefault();
    swiped.current = false;
  }
};

  return (
    <div className="tp-product-item mb-25 transition-3">
      <div className="tp-product-thumb p-relative fix">
        <Link href={`/${locale}/product/${slugify(title)}-${id}`} onClick={handleClick}>
          <div 
            style={{
              width: '100%',
              height: '300px',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <BlurImage 
              image={shownImage}
              alt={title || "product image"}
            />
            {/* Полоски: сообщают, что фото несколько, и показывают, какое открыто.
                Видны и на десктопе, и на телефоне.

                Подложка нужна по делу: фон у снимков товара любой — от светлого
                мрамора до чёрной детали во весь кадр, — и полоски без неё пропадали
                на тёмных фото. `pointer-events: none` — чтобы они не перехватывали
                тап, который должен открыть карточку. */}
            {hasGallery && (
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  bottom: '10px',
                  display: 'flex',
                  justifyContent: 'center',
                  pointerEvents: 'none',
                  zIndex: 2,
                }}
              >
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '5px 8px',
                    borderRadius: '999px',
                    background: 'rgba(0, 0, 0, 0.35)',
                  }}
                >
                  {gallery.map((url, i) => (
                    <span
                      key={url || i}
                      style={{
                        width: i === shownIndex ? '20px' : '10px',
                        height: '3px',
                        borderRadius: '2px',
                        background: i === shownIndex ? '#ffffff' : 'rgba(255, 255, 255, 0.5)',
                        transition: 'width 0.25s ease, background-color 0.25s ease',
                      }}
                    />
                  ))}
                </span>
              </div>
            )}
          </div>
          {/* Out of Stock Badge - красная плашка поверх фотографии */}
          {isOutOfStock && (
            <div style={{
              position: 'absolute',
              top: '10px',
              left: '10px',
              backgroundColor: 'rgba(255, 0, 0, 0.7)',
              color: 'white',
              padding: '5px 10px',
              borderRadius: '5px',
              fontSize: '14px',
              fontWeight: 'bold',
              zIndex: 2
            }}>
              {t('outOfStock')}
            </div>
          )}
          
          <div className="tp-product-badge">
            {/* Другие badges если нужны */}
          </div>
        </Link>

        {/* product action */}
        <div className="tp-product-action">
          <div className="tp-product-action-item d-flex flex-column">
            {isAddedToCart ? (
              <Link
                href={getLocalizedLink('/cart', 'product-item action')}
                className={`tp-product-action-btn ${isAddedToCart ? 'active' : ''} tp-product-add-cart-btn`}
              >
                <Cart /> <span className="tp-product-tooltip">{t('viewCart')}</span>
              </Link>
            ) : (
              <button
                onClick={() => handleAddProduct(product)}
                type="button"
                className={`tp-product-action-btn ${isAddedToCart ? 'active' : ''} tp-product-add-cart-btn`}
                disabled={isOutOfStock}
              >
                <Cart />
                <span className="tp-product-tooltip">{t('addToCart')}</span>
              </button>
            )}
            <button
              onClick={() => dispatch(handleProductModal(product))}
              type="button"
              className="tp-product-action-btn tp-product-quick-view-btn"
            >
              <QuickView />
              <span className="tp-product-tooltip">{t('quickView')}</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* product content */}
      <div className="tp-product-content" style={{ height: '160px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div className="tp-product-category">
            <span>{category?.name}</span>
          </div>
          <h3 className="tp-product-title" style={{ 
            height: '48px', 
            overflow: 'hidden', 
            display: '-webkit-box', 
            WebkitLineClamp: 2, 
            WebkitBoxOrient: 'vertical',
            lineHeight: '24px'
          }}>
            <Link href={`/${locale}/product/${slugify(title)}-${id}`}>{title}</Link>
          </h3>
        </div>
        <div className="d-flex flex-column gap-2">
          <div className="tp-product-price-wrapper" style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '8px' }}>
            <span className="tp-product-price">{(Number(price_minor || 0) / 100).toFixed(2)} ₴</span>
            <span style={{ fontSize: '13px', color: normalizedResidue > 0 ? '#28a745' : '#dc3545', whiteSpace: 'nowrap', fontWeight: 500 }}>
              {t('remainingStock', { count: normalizedResidue })}
            </span>
          </div>
          <div>
            {isAddedToCart ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'stretch',
                  justifyContent: 'space-between',
                  gap: '0'
                }}
              >
                <QuantityInput
                  value={currentOrderQuantity}
                  max={normalizedResidue}
                  onChange={handleQuantityChange}
                  wrapperStyle={{
                    margin: 0,
                    height: '40px',
                    flex: 1,
                    borderRadius: '4px 0 0 4px',
                    overflow: 'hidden'
                  }}
                  buttonStyle={{ borderRadius: 0 }}
                  inputStyle={{ borderRadius: 0, height: '100%' }}
                />

                <Link
                  href={getLocalizedLink('/cart', 'product-item button')}
                  className="d-inline-flex align-items-center justify-content-center"
                  style={{
                    width: '40px',
                    height: '40px',
                    minWidth: '40px',
                    backgroundColor: '#010F1C',
                    color: '#fff',
                    borderRadius: '0 4px 4px 0'
                  }}
                  aria-label={t('viewCart')}
                  title={t('viewCart')}
                >
                  <Cart width={16} height={16} />
                </Link>
              </div>
            ) : (
              <>
                <button
                  onClick={() => !isOutOfStock && handleAddProduct(product)}
                  type="button"
                  className={`tp-btn-sm w-100 ${isOutOfStock ? 'out-of-stock-btn' : ''}`}
                  disabled={isOutOfStock}
                  style={{
                    fontSize: '14px',
                    padding: '8px 15px',
                    height: '40px',
                    minHeight: '40px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: isOutOfStock ? '#f0f0f0' : '#de8043',
                    color: isOutOfStock ? '#a0a0a0' : '#fff',
                    border: '1px solid #e0e0e0',
                    borderRadius: '4px',
                    cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                    transition: 'background-color 0.3s ease'
                  }}
                >
                  <span style={{ marginRight: '5px', display: 'inline-block', verticalAlign: 'middle' }}>
                    <Cart width={16} height={16} />
                  </span>
                  {isOutOfStock ? t('outOfStock') : t('addToCart')}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductItem;
