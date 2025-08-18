'use client';
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { useTranslations } from 'next-intl';
// internal
import { Cart, QuickView } from "@/svg";
import { handleProductModal } from "@/redux/features/productModalSlice";
import { add_cart_product } from "@/redux/features/cartSlice";
import BlurImage from "@/components/common/BlurImage";
import { getProductImage, getProductId } from "@/utils/image-utils";

const ProductItem = ({ product }) => {
  const t = useTranslations('ProductItem');
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
        <Link href={`/product-details/${id || ''}`}>
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
          <div className="tp-product-badge">
            {isOutOfStock && <span className="product-hot">{t('outOfStock')}</span>}
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
      <div className="tp-product-content" style={{ height: '120px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div className="tp-product-category">
            <a href="#">{category?.title}</a>
          </div>
          <h3 className="tp-product-title" style={{ 
            height: '48px', 
            overflow: 'hidden', 
            display: '-webkit-box', 
            WebkitLineClamp: 2, 
            WebkitBoxOrient: 'vertical',
            lineHeight: '24px'
          }}>
            <Link href={`/product-details/${id}`}>{title}</Link>
          </h3>
        </div>
        <div className="tp-product-price-wrapper">
          <span className="tp-product-price new-price">{(price_minor/100)?.toFixed(2)} ₴</span>
        </div>
      </div>
    </div>
  );
};

export default ProductItem;