import React from "react";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
// internal
import { Cart, QuickView, Wishlist } from "@/svg";
import { handleProductModal } from "@/redux/features/productModalSlice";
import { add_cart_product } from "@/redux/features/cartSlice";
import { add_to_wishlist } from "@/redux/features/wishlist-slice";
import BlurImage from "@/components/common/BlurImage";

const ProductItem = ({ product, prdCenter = false,primary_style=false }) => {
  const { _id, img, images, imageURLs, title, discount, price, tags, status } = product || {};
  
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
  const { cart_products } = useSelector((state) => state.cart);
  const { wishlist } = useSelector((state) => state.wishlist);
  const isAddedToCart = cart_products.some((prd) => prd._id === _id);
  const isAddedToWishlist = wishlist.some((prd) => prd._id === _id);
  const dispatch = useDispatch();

  // handle add product
  const handleAddProduct = (prd) => {
    dispatch(add_cart_product(prd));
  };
   // handle wishlist product
   const handleWishlistProduct = (prd) => {
    dispatch(add_to_wishlist(prd));
  };

  return (
    <div
      className={`tp-product-item-3 mb-50 ${primary_style?"tp-product-style-primary":""} ${prdCenter ? "text-center" : ""}`}
    >
      <div className="tp-product-thumb-3 mb-15 fix p-relative z-index-1">
        <Link href={`/product-details/${_id}`}>
          <div style={{ width: '282px', height: '320px', position: 'relative' }}>
            <BlurImage image={productImage} alt={title || 'Product Image'} />
          </div>
        </Link>

        <div className="tp-product-badge">
          {status === 'out-of-stock' && <span className="product-hot">out-stock</span>}
        </div>

        {/* product action */}
        <div className="tp-product-action-3 tp-product-action-blackStyle">
          <div className="tp-product-action-item-3 d-flex flex-column">
            {isAddedToCart ? (
              <Link
                href="/cart"
                className={`tp-product-action-btn-3 ${isAddedToCart?'active':''} tp-product-add-cart-btn text-center`}
              >
                <Cart />
                <span className="tp-product-tooltip">View Cart</span>
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => handleAddProduct(product)}
                className={`tp-product-action-btn-3 ${isAddedToCart?'active':''} tp-product-add-cart-btn`}
                disabled={status === 'out-of-stock'}
              >
                <Cart />
                <span className="tp-product-tooltip">Add to Cart</span>
              </button>
            )}
            <button
              onClick={() => dispatch(handleProductModal(product))}
              className="tp-product-action-btn-3 tp-product-quick-view-btn"
            >
              <QuickView />
              <span className="tp-product-tooltip">Quick View</span>
            </button>

            <button disabled={status === 'out-of-stock'} onClick={()=> handleWishlistProduct(product)} className={`tp-product-action-btn-3 
            ${isAddedToWishlist?'active':''} tp-product-add-to-wishlist-btn`}>
              <Wishlist />
              <span className="tp-product-tooltip">Add To Wishlist</span>
            </button>

          </div>
        </div>

        <div className="tp-product-add-cart-btn-large-wrapper">
          {isAddedToCart ? (
            <Link
              href="/cart"
              className="tp-product-add-cart-btn-large text-center"
            >
              View To Cart
            </Link>
          ) : (
            <button
              onClick={() => handleAddProduct(product)}
              type="button"
              className="tp-product-add-cart-btn-large"
              disabled={status === 'out-of-stock'}
            >
              Add To Cart
            </button>
          )}
        </div>
      </div>
      <div className="tp-product-content-3" style={{ height: '120px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div className="tp-product-tag-3">
            <span>{tags && tags[1] ? tags[1] : 'Product'}</span>
          </div>
          <h3 className="tp-product-title-3" style={{ 
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
        <div className="tp-product-price-wrapper-3">
          <span className="tp-product-price-3">{price.toFixed(2)} ₴</span>
        </div>
      </div>
    </div>
  );
};

export default ProductItem;
