'use client';
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
// internal
import { Close, Minus, Plus } from "@/svg";
import {add_cart_product,quantityDecrement} from "@/redux/features/cartSlice";
import { remove_wishlist_product } from "@/redux/features/wishlist-slice";
import BlurImage from "@/components/common/BlurImage";

const WishlistItem = ({ product }) => {
  const { _id, img, images, imageURLs, title, price } = product || {};
  
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
  const isAddToCart = cart_products.find((item) => item._id === _id);
  const dispatch = useDispatch();
  // handle add product
  const handleAddProduct = (prd) => {
    dispatch(add_cart_product(prd));
  };
  // handle decrement product
  const handleDecrement = (prd) => {
    dispatch(quantityDecrement(prd));
  };

  // handle remove product
  const handleRemovePrd = (prd) => {
    dispatch(remove_wishlist_product(prd));
  };
  return (
    <tr>
      <td className="tp-cart-img">
        <Link href={`/product-details/${_id}`}>
          <div style={{ width: '70px', height: '100px', position: 'relative' }}>
            <BlurImage image={productImage} alt={title || 'Product Image'} />
          </div>
        </Link>
      </td>
      <td className="tp-cart-title">
        <Link href={`/product-details/${_id}`}>{title}</Link>
      </td>
      <td className="tp-cart-price">
        <span>${price.toFixed(2)}</span>
      </td>
      <td className="tp-cart-quantity">
        <div className="tp-product-quantity mt-10 mb-10">
          <span
            onClick={() => handleDecrement(product)}
            className="tp-cart-minus"
          >
            <Minus />
          </span>
          <input
            className="tp-cart-input"
            type="text"
            value={isAddToCart ? isAddToCart?.orderQuantity : 0}
            readOnly
          />
          <span
            onClick={() => handleAddProduct(product)}
            className="tp-cart-plus"
          >
            <Plus />
          </span>
        </div>
      </td>

      <td className="tp-cart-add-to-cart">
        <button
          onClick={() => handleAddProduct(product)}
          type="button"
          className="tp-btn tp-btn-2 tp-btn-blue"
        >
          Add To Cart
        </button>
      </td>

      <td className="tp-cart-action">
        <button
          onClick={() => handleRemovePrd({ title, id: _id })}
          className="tp-cart-action-btn"
        >
          <Close />
          <span> Remove</span>
        </button>
      </td>
    </tr>
  );
};

export default WishlistItem;
