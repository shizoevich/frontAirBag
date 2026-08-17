'use client';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
// internal
import QuantityInput from '@/components/common/quantity-input';
import { setQuantity } from '@/redux/features/cartSlice';

const ProductQuantity = ({ maxQuantity = 10 }) => {
  const { orderQuantity } = useSelector((state) => state.cart);
  const dispatch = useDispatch();

  // Устанавливаем начальное количество не больше максимального
  useEffect(() => {
    // Если текущее количество больше максимального, устанавливаем максимальное
    if (orderQuantity > maxQuantity) {
      dispatch(setQuantity(maxQuantity));
    }
    // Если максимальное количество 0, устанавливаем 1 (для отображения в интерфейсе)
    else if (maxQuantity === 0 && orderQuantity !== 1) {
      dispatch(setQuantity(1));
    }
  }, [maxQuantity, orderQuantity, dispatch]);

  return (
    <div className="tp-product-details-quantity">
      <QuantityInput
        className="mb-15 mr-15"
        value={orderQuantity}
        max={maxQuantity}
        onChange={(quantity) => dispatch(setQuantity(quantity))}
      />
    </div>
  );
};

export default ProductQuantity;
