import React, { useEffect, useState } from "react";
import { useTranslations, useLocale } from 'next-intl';
import { useDispatch } from "react-redux";
import Link from "next/link";
import { Rating } from "react-simple-star-rating";
// internal
import { Cart, CompareThree, QuickView } from "@/svg";
import { handleProductModal } from "@/redux/features/productModalSlice";
import { add_cart_product } from "@/redux/features/cartSlice";
import BlurImage from "@/components/common/BlurImage";
import { add_to_compare } from "@/redux/features/compareSlice";

const ShopListItem = ({ product }) => {
  const locale = useLocale();
  const { _id, img, images, imageURLs, category, title, reviews, price_minor, discount, tags, description } = product || {};
  
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
  const dispatch = useDispatch()
  const [ratingVal, setRatingVal] = useState(0);
  useEffect(() => {
    if (reviews && reviews.length > 0) {
      const rating =
        reviews.reduce((acc, review) => acc + review.rating, 0) /
        reviews.length;
      setRatingVal(rating);
    } else {
      setRatingVal(0);
    }
  }, [reviews]);

  // handle add product
  const handleAddProduct = (prd) => {
    dispatch(add_cart_product(prd));
  };


  // handle compare product
  const handleCompareProduct = (prd) => {
    dispatch(add_to_compare(prd));
  };

  return (
    <div className="tp-product-list-item d-md-flex">
      <div className="tp-product-list-thumb p-relative fix">
        <Link href={`/${locale}/product-details/${_id}`}>
          <div style={{ width: '306px', height: '350px', position: 'relative' }}>
            <BlurImage image={productImage} alt={title || 'Product Image'} />
          </div>
        </Link>

        {/* <!-- product action --> */}
        <div className="tp-product-action-2 tp-product-action-blackStyle">
          <div className="tp-product-action-item-2 d-flex flex-column">
            <button
              type="button"
              className="tp-product-action-btn-2 tp-product-quick-view-btn"
              onClick={() => dispatch(handleProductModal(product))}
            >
              <QuickView />
              <span className="tp-product-tooltip tp-product-tooltip-right">
                Quick View
              </span>
            </button>
            <button
              type="button"
              onClick={()=> handleCompareProduct(product)}
              className="tp-product-action-btn-2 tp-product-add-to-compare-btn"
            >
              <CompareThree />
              <span className="tp-product-tooltip tp-product-tooltip-right">
                Add To Compare
              </span>
            </button>
          </div>
        </div>
      </div>
      <div className="tp-product-list-content">
        <div className="tp-product-content-2 pt-15">
          <div className="tp-product-tag-2">
            {tags?.map((t, i) => <a key={i} href="#">{t}</a>)}
          </div>
          <h3 className="tp-product-title-2">
            <Link href={`/${locale}/product-details/${_id}`}>{title}</Link>
          </h3>
          <div className="tp-product-rating-icon tp-product-rating-icon-2">
            <Rating allowFraction size={16} initialValue={ratingVal} readonly={true} />
          </div>
          <div className="tp-product-price-wrapper-2">
            {discount > 0 ? (
              <>
                <span className="tp-product-price-2 new-price">${price_minor}</span>
                <span className="tp-product-price-2 old-price">
                  {" "} ${(Number(price_minor || 0) / 100 - (Number(price_minor || 0) / 100 * Number(discount))).toFixed(2)}
                </span>
              </>
            ) : (
              <span className="tp-product-price-2 new-price">${price_minor}</span>
            )}
          </div>
          <p>
            {description.substring(0, 100)}
          </p>
          <div className="tp-product-list-add-to-cart">
            <button onClick={() => handleAddProduct(product)} className="tp-product-list-add-to-cart-btn">
              Add To Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopListItem;
