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
  
  const { _id, img, category, title, reviews, price, status } = product || {};
  const [ratingVal, setRatingVal] = useState(0);

  useEffect(() => {
    setIsClient(true);
  }, []);

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

  if (!isClient) {
    return <div className="tp-product-item mb-25" />; // Скелетон для SSR
  }

  const isAddedToCart = cart_products.some((prd) => prd._id === _id);
  const isAddedToWishlist = wishlist.some((prd) => prd._id === _id);

  // handle add product
  const handleAddProduct = (prd) => {
    dispatch(add_cart_product(prd));
  };

  // handle wishlist product
  const handleWishlistProduct = (prd) => {
    dispatch(add_to_wishlist(prd));
  };

  return (
    <div className="tp-product-item mb-25 transition-3">
      <div className="tp-product-thumb p-relative fix">
        <Link href={`/product-details/${_id}`}>
          <Image
            src={img}
            width="0"
            height="0"
            sizes="100vw"
            style={{ width: '100%', height: 'auto' }}
            alt="product-electronic"
          />
          <div className="tp-product-badge">
            {status === 'out-of-stock' && <span className="product-hot">out-stock</span>}
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
                disabled={status === 'out-of-stock'}
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
              disabled={status === 'out-of-stock'}
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
          <a href="#">{category?.name}</a>
        </div>
        <h3 className="tp-product-title">
          <Link href={`/product-details/${_id}`}>{title}</Link>
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
            <span>
              ({reviews && reviews.length > 0 ? reviews.length : 0} Review)
            </span>
          </div>
        </div>
        <div className="tp-product-price-wrapper">
          <span className="tp-product-price new-price">${parseFloat(price).toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default ProductItem;