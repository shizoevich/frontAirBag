import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import BlurImage from "@/components/common/BlurImage";

const ProductSmItem = ({ product }) => {
  const {_id, img, images, imageURLs, category, title, price_minor, reviews } = product || {};
  
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
          </div>
        </Link>
      </div>
      <div className="tp-product-sm-content" style={{ height: '120px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
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
        <div className="tp-product-price-wrapper">
          <span className="tp-product-price">{(Number(price_minor || 0) / 100).toFixed(2)} ₴</span>
        </div>
      </div>
    </div>
  );
};

export default ProductSmItem;
