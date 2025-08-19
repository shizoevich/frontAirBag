import React, { useState } from 'react';
import { useGetDiscountsQuery, useApplyDiscountMutation } from '@/redux/features/discountsApi';
import { useTranslations } from 'next-intl';

const DiscountForm = ({ onDiscountApplied, currentTotal }) => {
  const t = useTranslations('Discounts');
  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(null);
  const [error, setError] = useState('');
  
  const { data: discounts } = useGetDiscountsQuery();
  const [applyDiscount, { isLoading }] = useApplyDiscountMutation();

  const handleApplyDiscount = async (e) => {
    e.preventDefault();
    setError('');

    if (!discountCode.trim()) return;

    try {
      // Найти скидку по коду (в реальном приложении это должно быть на бэкенде)
      const discount = discounts?.results?.find(d => 
        d.id.toString() === discountCode || 
        d.percentage === discountCode
      );

      if (!discount) {
        setError(t('invalid_discount'));
        return;
      }

      // Применить скидку
      const discountAmount = (currentTotal * parseFloat(discount.percentage)) / 100;
      const newTotal = currentTotal - discountAmount;

      setAppliedDiscount({
        ...discount,
        discountAmount,
        newTotal
      });

      if (onDiscountApplied) {
        onDiscountApplied(discount, discountAmount, newTotal);
      }

      setDiscountCode('');
    } catch (err) {
      setError(t('invalid_discount'));
    }
  };

  const removeDiscount = () => {
    setAppliedDiscount(null);
    if (onDiscountApplied) {
      onDiscountApplied(null, 0, currentTotal);
    }
  };

  return (
    <div className="tp-checkout-discount">
      {!appliedDiscount ? (
        <form onSubmit={handleApplyDiscount} className="tp-discount-form">
          <div className="tp-discount-input">
            <input
              type="text"
              placeholder={t('discount_code')}
              value={discountCode}
              onChange={(e) => setDiscountCode(e.target.value)}
              className="form-control"
            />
            <button 
              type="submit" 
              className="tp-btn tp-btn-2"
              disabled={isLoading || !discountCode.trim()}
            >
              {isLoading ? '...' : t('apply_discount')}
            </button>
          </div>
          {error && (
            <div className="tp-discount-error text-danger mt-2">
              {error}
            </div>
          )}
        </form>
      ) : (
        <div className="tp-discount-applied">
          <div className="tp-discount-info d-flex justify-content-between align-items-center">
            <div>
              <span className="tp-discount-label">{t('discount_applied')}: </span>
              <strong>{appliedDiscount.percentage}%</strong>
            </div>
            <button 
              onClick={removeDiscount}
              className="btn btn-sm btn-outline-danger"
            >
              ×
            </button>
          </div>
          <div className="tp-discount-amount text-success">
            -{(appliedDiscount.discountAmount / 100).toFixed(2)} ₴
          </div>
        </div>
      )}
    </div>
  );
};

export default DiscountForm;
