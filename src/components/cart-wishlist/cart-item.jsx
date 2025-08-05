'use client';
import React from "react";
import { useDispatch } from "react-redux";
import Link from "next/link";
// internal
import { Close, Minus, Plus } from "@/svg";
import { add_cart_product, quantityDecrement, remove_product } from "@/redux/features/cartSlice";
import BlurImage from "@/components/common/BlurImage";
import { getProductImage, getProductId } from "@/utils/image-utils";

const CartItem = ({product}) => {
  const { title, price, category, status, orderQuantity = 0 } = product || {};
  
  // Используем утилиты для получения ID и изображения
  const productId = getProductId(product);
  const productImage = getProductImage(product);

  const dispatch = useDispatch();

    // handle add product
    const handleAddProduct = (prd) => {
      dispatch(add_cart_product(prd))
    }
    // handle decrement product
    const handleDecrement = (prd) => {
      dispatch(quantityDecrement(prd))
    }
  
    // handle remove product
    const handleRemovePrd = (prd) => {
      dispatch(remove_product(prd))
    }

  return (
    <tr>
      {/* img */}
      <td className="tp-cart-img">
        <Link href={`/product-details/${productId}`}>
          <div style={{ width: '70px', height: '100px', position: 'relative' }}>
            <BlurImage image={productImage} alt={title || 'Product Image'} />
          </div>
        </Link>
      </td>
      {/* title */}
      <td className="tp-cart-title">
        <Link href={`/product-details/${productId}`}>{title}</Link>
      </td>
      {/* price */}
      <td className="tp-cart-price">
        <span>${(price * orderQuantity).toFixed(2)}</span>
      </td>
      {/* quantity */}
      <td className="tp-cart-quantity">
        <div className="tp-product-quantity mt-10 mb-10">
          <span onClick={()=> handleDecrement(product)} className="tp-cart-minus">
            <Minus />
          </span>
          <input className="tp-cart-input" type="text" value={orderQuantity} readOnly />
          <span onClick={()=> handleAddProduct(product)} className="tp-cart-plus">
            <Plus />
          </span>
        </div>
      </td>
      {/* action */}
      <td className="tp-cart-action">
        <button onClick={()=> handleRemovePrd({title,id:_id})} className="tp-cart-action-btn">
          <Close />
          <span>{" "}Remove</span>
        </button>
      </td>
    </tr>
  );
};

export default CartItem;
