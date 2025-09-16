import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslations } from 'next-intl';
import { Cart } from "@/svg";
import { add_cart_product } from "@/redux/features/cartSlice";
import BlurImage from "@/components/common/BlurImage";

const ProductSmItem = ({ product }) => {
  const t = useTranslations('ProductItem');
  const {_id, img, images, imageURLs, category, title, price_minor, reviews, residue } = product || {};
  const dispatch = useDispatch();
  const { cart_products } = useSelector((state) => state.cart);
  
  // Проверка на наличие товара в корзине
  const isAddedToCart = cart_products.some((prd) => {
    const prdId = prd.id || prd._id;
    const currentId = _id || product._id;
    return prdId === currentId;
  });
  
  // Проверка на наличие товара на складе
  const isOutOfStock = residue === 0;
  
  // Обработчик добавления товара в корзину
  const handleAddProduct = (prd) => {
    dispatch(add_cart_product(prd));
  };
  
  // Получаем изображение из API с правильной логикой
  let productImage = '/assets/img/product/3/product-1.jpg'; // заглушка по умолчанию
  
  if (imageURLs && Array.isArray(imageURLs) && imageURLs.length > 0) {
    // Если есть imageURLs, используем первое изображение
    productImage = imageURLs[0].img || imageURLs[0];
  } else if (images && Array.isArray(images) && images.length > 0) {
    // Если есть images, используем первое изображение
    productImage = typeof images[0] === 'string' ? images[0] : images[0].url || images[0].img || images[0];
  } else if (img) {
    // Если есть img, используем его
    productImage = img;
  }


  return (
    <div className="tp-product-sm-item d-flex align-items-center">
      <div className="tp-product-thumb mr-25 fix">
        <Link href={`/product-details/${_id}`}>
          <div style={{ width: '140px', height: '140px', position: 'relative' }}>
            <BlurImage image={productImage} alt={title || 'Product Image'} />
            {isOutOfStock && (
              <div className="product-badge" style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: '#f04242',
                color: '#fff',
                fontSize: '12px',
                padding: '3px 8px',
                borderRadius: '3px'
              }}>
                {t('outOfStock')}
              </div>
            )}
          </div>
        </Link>
      </div>
      <div className="tp-product-sm-content" style={{ height: '140px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
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
            <Link href={`/product-details/${_id}`}>{title}</Link>
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
                  fontSize: '13px',
                  padding: '6px 12px',
                  backgroundColor: '#de8043',
                  color: '#fff',
                  borderRadius: '4px'
                }}
              >
                <span style={{ marginRight: '5px', display: 'inline-block', verticalAlign: 'middle' }}>
                  <Cart width={14} height={14} />
                </span>
                {t('viewCart')}
              </Link>
            ) : (
              <button
                onClick={() => handleAddProduct(product)}
                type="button"
                className="tp-btn-sm w-100"
                disabled={isOutOfStock}
                style={{
                  fontSize: '13px',
                  padding: '6px 12px',
                  backgroundColor: isOutOfStock ? '#ccc' : '#de8043',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: isOutOfStock ? 'not-allowed' : 'pointer'
                }}
              >
                <span style={{ marginRight: '5px', display: 'inline-block', verticalAlign: 'middle' }}>
                  <Cart width={14} height={14} />
                </span>
                {t('addToCart')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductSmItem;
