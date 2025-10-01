'use client';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
// internal
import { AskQuestion} from '@/svg';
import DetailsBottomInfo from './details-bottom-info';
import ProductDetailsCountdown from './product-details-countdown';
import ProductQuantity from './product-quantity';
import StockNotification from './stock-notification';
import { add_cart_product } from '@/redux/features/cartSlice';
import { handleModalClose } from '@/redux/features/productModalSlice';

const DetailsWrapper = ({ productItem, handleImageActive, activeImg, detailsBottom = false }) => {
  const t = useTranslations('ProductDetails');
  const { sku, img, title, imageURLs, category, description, discount, price_minor, status, tags, offerDate, residue = 0 } = productItem || {};
  // Определяем доступность товара на основе residue
  const isAvailable = residue > 0;
  const [textMore, setTextMore] = useState(false);
  const dispatch = useDispatch()

  // handle add product
  const handleAddProduct = (prd) => {
    dispatch(add_cart_product(prd));
  };



  

  return (
    <div className="tp-product-details-wrapper">
      <div className="tp-product-details-category">
        <span>{category?.name}</span>
      </div>
      <h3 className="tp-product-details-title">{title}</h3>

      
      {/* stock notification */}
      <StockNotification availableQuantity={residue} requestedQuantity={0} />
      {description && (
        <p>{textMore ? description : `${description.substring(0, 100)}...`}
          <span onClick={() => setTextMore(!textMore)}>{textMore ? t('seeLess') : t('seeMore')}</span>
        </p>
      )}

      {/* price */}
      <div className="tp-product-details-price-wrapper mb-20">
        {discount > 0 ? (
          <>
            <span className="tp-product-details-price old-price">₴{(Number(price_minor || 0) / 100).toFixed(2)}</span>
            <span className="tp-product-details-price new-price">
              {" "}{(Number(price_minor || 0) / 100 - (Number(price_minor || 0) / 100 * Number(discount))).toFixed(2)}₴
            </span>
          </>
        ) : (
          <span className="tp-product-details-price new-price">{(Number(price_minor || 0) / 100).toFixed(2)}₴</span>
        )}
      </div>

      {/* variations */}
      {imageURLs && Array.isArray(imageURLs) && imageURLs.some(item => item?.color && item?.color?.name) && <div className="tp-product-details-variation">
        <div className="tp-product-details-variation-item">
          <h4 className="tp-product-details-variation-title">{t('colorLabel')}</h4>
          <div className="tp-product-details-variation-list">
            {imageURLs && imageURLs.map((item, i) => (
              <button onClick={() => handleImageActive(item)} key={i} type="button"
                className={`color tp-color-variation-btn ${item.img === activeImg ? "active" : ""}`} >
                <span
                  data-bg-color={`${item.color.clrCode}`}
                  style={{ backgroundColor: `${item.color.clrCode}` }}
                ></span>
                {item.color && item.color.name && (
                  <span className="tp-color-variation-tootltip">
                    {item.color.name}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>}

      {/* if ProductDetailsCountdown true start */}
      {offerDate?.endDate && <ProductDetailsCountdown offerExpiryTime={offerDate?.endDate} />}
      {/* if ProductDetailsCountdown true end */}

      {/* actions */}
      <div className="tp-product-details-action-wrapper">
        <h3 className="tp-product-details-action-title">{t('quantityLabel')}</h3>
        <div className="tp-product-details-action-item-wrapper d-sm-flex align-items-center">
          {isAvailable && <ProductQuantity maxQuantity={residue} />}
          <div className="tp-product-details-add-to-cart mb-15 w-100">
            <button
              onClick={() => isAvailable && dispatch(handleModalClose()) && router.push('/cart')}
              disabled={!isAvailable}
              className="tp-product-details-buy-now-btn w-100"
              style={{
                backgroundColor: isAvailable ? '#010f1c' : '#f0f0f0',
                color: isAvailable ? '#ffffff' : '#a0a0a0',
                cursor: isAvailable ? 'pointer' : 'not-allowed',
                border: isAvailable ? 'none' : '1px solid #e0e0e0',
              }}
            >
              {isAvailable ? t('buyNow') : t('outOfStock')}
            </button>
          </div>
        </div>
        <button
          onClick={() => isAvailable && handleAddProduct(productItem)}
          disabled={!isAvailable}
          className="tp-product-details-add-to-cart-btn w-100"
          style={{
            backgroundColor: isAvailable ? '#de8043' : '#f0f0f0',
            color: isAvailable ? '#ffffff' : '#a0a0a0',
            cursor: isAvailable ? 'pointer' : 'not-allowed',
            border: isAvailable ? 'none' : '1px solid #e0e0e0',
          }}
        >
          {isAvailable ? t('addToCart') : t('outOfStock')}
        </button>

      </div>
      {/* product-details-action-sm start */}
      <div className="tp-product-details-action-sm">
        <button type="button" className="tp-product-details-action-sm-btn">
          <AskQuestion />
          {t('askQuestion')}
        </button>
      </div>
      {/* product-details-action-sm end */}

      {detailsBottom && <DetailsBottomInfo category={category?.name} sku={sku} tag={tags && tags[0]} />}
    </div>
  );
};

export default DetailsWrapper;