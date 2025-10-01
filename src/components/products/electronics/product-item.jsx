'use client';
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { useTranslations, useLocale } from 'next-intl';
// internal
import { Cart, QuickView } from "@/svg";
import { handleProductModal } from "@/redux/features/productModalSlice";
import { add_cart_product } from "@/redux/features/cartSlice";
import BlurImage from "@/components/common/BlurImage";
import { getProductImage, getProductId } from "@/utils/image-utils";
import { slugify } from '@/utils/slugify';

const ProductItem = ({ product }) => {
  const t = useTranslations('ProductItem');
  const locale = useLocale();
  const [isClient, setIsClient] = useState(false);
  const { cart_products } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  
  const { id, category, title, price_minor, images, residue } = product || {};

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <div className="tp-product-item mb-25" />; // Скелетон для SSR
  }

  const isAddedToCart = cart_products.some((prd) => {
    const prdId = prd.id || prd._id;
    const currentId = id || product._id;
    return prdId === currentId;
  });
 
  const isOutOfStock = residue === 0;

  // handle add product
  const handleAddProduct = (prd) => {
    dispatch(add_cart_product(prd));
  };



  return (
    <div className="tp-product-item mb-25 transition-3">
      <div className="tp-product-thumb p-relative fix">
        <Link href={`/${locale}/product/${slugify(title)}-${id}`}>
          <div style={{
            width: '100%',
            height: '300px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <BlurImage 
              image={getProductImage(product)}
              alt={title || "product image"}
            />
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
                href="/cart"
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
            <a href="#">{category?.name}</a>
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
          <div className="tp-product-price-wrapper">
            <span className="tp-product-price">{(Number(price_minor || 0) / 100).toFixed(2)} ₴</span>
          </div>
          <div>
            {isAddedToCart ? (
              <Link
                href="/cart"
                className="tp-btn-sm w-100 d-inline-block text-center"
                style={{
                  fontSize: '14px',
                  padding: '8px 15px',
                  backgroundColor: '#010F1C',
                  color: '#fff',
                  borderRadius: '4px'
                }}
              >
                <span style={{ marginRight: '5px', display: 'inline-block', verticalAlign: 'middle' }}>
                  <Cart width={16} height={16} />
                </span>
                {t('viewCart')}
              </Link>
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