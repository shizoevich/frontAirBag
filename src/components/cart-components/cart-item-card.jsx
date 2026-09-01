'use client';
import React from 'react';
import { useDispatch } from 'react-redux';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
// internal
import { Close } from '@/svg';
import QuantityInput from '@/components/common/quantity-input';
import { remove_product, setCartQuantity } from '@/redux/features/cartSlice';
import { getProductImage, getProductId } from '@/utils/image-utils';
import { slugify } from '@/utils/slugify';

/**
 * Товар корзины на узком экране.
 *
 * Табличная вёрстка корзины требует 840 px и ниже 1200 px уезжала в
 * горизонтальный скролл: на телефоне 390 px из неё было видно 325 px, а колонка
 * количества оставалась за краем экрана. Клиенты не могли изменить количество и
 * не понимали, почему. Здесь всё помещается по вертикали, без скролла.
 */
const CartItemCard = ({ product }) => {
  const { title, price_minor, orderQuantity = 0, residue } = product || {};
  const productId = getProductId(product);
  const productImage = getProductImage(product);
  const href = `/${useParams().locale}/product/${slugify(title)}-${productId}`;

  const dispatch = useDispatch();
  const t = useTranslations('Cart');

  const unitPrice = Number(price_minor || 0) / 100;
  const lineTotal = unitPrice * orderQuantity;

  return (
    <li className="tp-cart-card">
      <Link href={href} className="tp-cart-card-thumb">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={productImage} alt={title || 'Product Image'} />
      </Link>

      <div className="tp-cart-card-body">
        <Link href={href} className="tp-cart-card-title">{title}</Link>

        <span className="tp-cart-card-unit">
          {unitPrice.toFixed(2)}₴
        </span>

        <div className="tp-cart-card-controls">
          <QuantityInput
            value={orderQuantity}
            max={Number(residue ?? 0)}
            onChange={(quantity) => dispatch(setCartQuantity({ id: productId, quantity }))}
          />
          <span className="tp-cart-card-total">{lineTotal.toFixed(2)}₴</span>
        </div>
      </div>

      <button
        type="button"
        className="tp-cart-card-remove"
        aria-label={t('remove')}
        title={t('remove')}
        onClick={() => dispatch(remove_product({ title, id: productId }))}
      >
        <Close />
      </button>
    </li>
  );
};

export default CartItemCard;
