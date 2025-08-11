'use client';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
// internal
import { Minus, Plus } from '@/svg';
import { decrement, increment, setQuantity } from '@/redux/features/cartSlice';

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
  
  // handleIncrease
  const handleIncrease = () => {
    if (orderQuantity < maxQuantity) {
      dispatch(increment());
    }
  };
  
  // handleDecrease
  const handleDecrease = () => {
    dispatch(decrement());
  };
  return (
    <div className="tp-product-details-quantity">
    <div className="tp-product-quantity mb-15 mr-15">
      <span className={`tp-cart-minus ${orderQuantity <= 1 ? 'disabled' : ''}`} onClick={handleDecrease}>
        <Minus />
      </span>
      <input className="tp-cart-input" type="text" readOnly value={orderQuantity} />
      <span className={`tp-cart-plus ${orderQuantity >= maxQuantity || maxQuantity === 0 ? 'disabled' : ''}`} onClick={handleIncrease}>
        <Plus />
      </span>
    </div>
  </div>
  );
};

export default ProductQuantity;