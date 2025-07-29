import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Rating } from "react-simple-star-rating";
import { useDispatch, useSelector } from "react-redux";
// internal
import { Cart, QuickView, Wishlist } from "@/svg";
import { handleProductModal } from "@/redux/features/productModalSlice";
import { add_cart_product } from "@/redux/features/cartSlice";
import { add_to_wishlist } from "@/redux/features/wishlist-slice";

const ProductItem = ({ product }) => {
  const [isClient, setIsClient] = useState(false);
  const { cart_products } = useSelector((state) => state.cart);
  const { wishlist } = useSelector((state) => state.wishlist);
  const dispatch = useDispatch();
  
  const { id, category, title, price, images, residue } = product || {};
  const [ratingVal, setRatingVal] = useState(0);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <div className="tp-product-item mb-25" />;
  }

  const isAddedToCart = cart_products.some((prd) => prd.id === id);
  const isAddedToWishlist = wishlist.some((prd) => prd.id === id);
  const isOutOfStock = residue === 0;

  const handleAddProduct = (prd) => {
    dispatch(add_cart_product(prd));
  };

  const handleWishlistProduct = (prd) => {
    dispatch(add_to_wishlist(prd));
  };

  return (
    <div className="tp-product-item mb-25 transition-3">
      <div className="tp-product-thumb p-relative fix">
        <Link href={`/product-details/${id}`}>
          {images?.length > 0 && !imageError ? (
            <Image
              src={images[0]}
              width={300}
              height={300}
              alt={title || "product image"}
              className="img-fluid"
              style={{
                width: '100%',
                height: 'auto',
                objectFit: 'cover'
              }}
              onError={() => setImageError(true)}
              priority={false}
            />
          ) : (
            <div className="image-placeholder" style={{
              width: '100%',
              height: '300px',
              backgroundColor: '#f5f5f5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span>No Image</span>
            </div>
          )}
          <div className="tp-product-badge">
            {isOutOfStock && <span className="product-hot">out-stock</span>}
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
                <Cart /> <span className="tp-product-tooltip">View Cart</span>
              </Link>
            ) : (
              <button
                onClick={() => handleAddProduct(product)}
                type="button"
                className={`tp-product-action-btn ${isAddedToCart ? 'active' : ''} tp-product-add-cart-btn`}
                disabled={isOutOfStock}
              >
                <Cart />
                <span className="tp-product-tooltip">Add to Cart</span>
              </button>
            )}
            <button
              onClick={() => dispatch(handleProductModal(product))}
              type="button"
              className="tp-product-action-btn tp-product-quick-view-btn"
            >
              <QuickView />
              <span className="tp-product-tooltip">Quick View</span>
            </button>
            <button
              type="button"
              className={`tp-product-action-btn ${isAddedToWishlist ? 'active' : ''} tp-product-add-to-wishlist-btn`}
              onClick={() => handleWishlistProduct(product)}
              disabled={isOutOfStock}
            >
              <Wishlist />
              <span className="tp-product-tooltip">Add To Wishlist</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* product content */}
      <div className="tp-product-content">
        <div className="tp-product-category">
          <a href="#">{category?.title}</a>
        </div>
        <h3 className="tp-product-title">
          <Link href={`/product-details/${id}`}>{title}</Link>
        </h3>
        <div className="tp-product-rating d-flex align-items-center">
          <div className="tp-product-rating-icon">
            <Rating
              allowFraction
              size={16}
              initialValue={ratingVal}
              readonly={true}
            />
          </div>
          <div className="tp-product-rating-text">
            <span>(0 Review)</span>
          </div>
        </div>
        <div className="tp-product-price-wrapper">
          <span className="tp-product-price new-price">${price?.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default ProductItem;
