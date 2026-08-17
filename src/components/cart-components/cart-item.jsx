'use client';
import React from "react";
import { useDispatch } from "react-redux";
import Link from "next/link";
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
// internal
import { Close } from "@/svg";
import QuantityInput from "@/components/common/quantity-input";
import { remove_product, setCartQuantity } from "@/redux/features/cartSlice";
import { getProductImage, getProductId } from "@/utils/image-utils";
import { slugify } from "@/utils/slugify";

const CartItem = ({product}) => {
  const { title, price_minor, category, status, orderQuantity = 0, residue } = product || {};
  
  // Используем утилиты для получения ID и изображения
  const productId = getProductId(product);
  const productImage = getProductImage(product);

  const dispatch = useDispatch();
  const t = useTranslations('Cart');
  const { locale } = useParams();

    // handle quantity change (+/- или ручной ввод)
    const handleQuantityChange = (quantity) => {
      dispatch(setCartQuantity({ id: productId, quantity }))
    }

    // handle remove product
    const handleRemovePrd = (prd) => {
      dispatch(remove_product(prd))
    }

  return (
    <tr>
      {/* img */}
      <td className="tp-cart-img" style={{ textAlign: 'center' }}>
        <Link href={`/${locale}/product/${slugify(title)}-${productId}`} style={{ display: 'inline-block' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={productImage}
            alt={title || 'Product Image'}
            style={{ width: '70px', height: '70px', objectFit: 'cover', display: 'block', margin: '0 auto', borderRadius: '8px', background: '#f8f9fa' }}
          />
        </Link>
      </td>
      {/* title */}
      <td className="tp-cart-title">
        <Link href={`/${locale}/product/${slugify(title)}-${productId}`}>{title}</Link>
      </td>
      {/* price */}
      <td className="tp-cart-price">
        <span>{((Number(price_minor || 0) / 100) * orderQuantity).toFixed(2)}₴</span>
      </td>
      {/* quantity */}
      <td className="tp-cart-quantity">
        <QuantityInput
          className="mt-10 mb-10"
          value={orderQuantity}
          max={Number(residue ?? 0)}
          onChange={handleQuantityChange}
        />
      </td>
      {/* action */}
      <td className="tp-cart-action">
        <button onClick={()=> handleRemovePrd({title,id:productId})} className="tp-cart-action-btn">
          <Close />
          <span>{" "}{t('remove')}</span>
        </button>
      </td>
    </tr>
  );
};

export default CartItem;
