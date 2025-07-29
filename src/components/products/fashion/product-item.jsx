import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
// internal
import { Cart, QuickView, Wishlist } from "@/svg";
import { handleProductModal } from "@/redux/features/productModalSlice";
import { add_cart_product } from "@/redux/features/cartSlice";
import { add_to_wishlist } from "@/redux/features/wishlist-slice";
import BlurImage from "@/components/common/BlurImage";

const ProductItem = ({ product }) => {
  const [isClient, setIsClient] = useState(false);
  const { cart_products } = useSelector((state) => state.cart);
  const { wishlist } = useSelector((state) => state.wishlist);
  const dispatch = useDispatch();
  
  const { id, category, title, price, images, residue } = product || {};


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
          <div style={{
            width: '100%',
            height: '300px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <BlurImage 
              image={images?.length > 0 ? images[0] : null}
              alt={title || "product image"}
            />
          </div>
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
          <span className="tp-product-price new-price">{price?.toFixed(2)} ₴</span>
        </div>
      </div>
    </div>
  );
};

export default ProductItem;
