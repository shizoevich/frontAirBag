'use client';
import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
// internal
import { Minus, Plus } from '@/svg';
import { notifyError } from '@/utils/toast';

/**
 * Поле количества товара: кнопки +/- и ручной ввод числа.
 * Значение валидируется по границам [min, max]; при выходе за них
 * показывается ошибка, а поле возвращается к допустимому значению.
 */
const QuantityInput = ({
  value,
  max,
  min = 1,
  onChange,
  disabled = false,
  className = '',
  wrapperStyle,
  inputStyle,
  buttonStyle,
}) => {
  const t = useTranslations('Cart');

  const currentValue = Number(value) || min;
  const parsedMax = Number(max);
  const maxQuantity = Number.isFinite(parsedMax) ? parsedMax : Infinity;
  const hasStock = maxQuantity >= min;

  const [draft, setDraft] = useState(String(currentValue));

  // Значение может измениться извне (+/-, другой компонент, localStorage)
  useEffect(() => {
    setDraft(String(currentValue));
  }, [currentValue]);

  const canDecrease = !disabled && currentValue > min;
  const canIncrease = !disabled && hasStock && currentValue < maxQuantity;

  const apply = (next) => {
    if (next !== currentValue) {
      onChange(next);
    }
    setDraft(String(next));
  };

  const handleDecrease = () => {
    if (disabled) return;
    if (!canDecrease) {
      notifyError(t('quantityMin', { min }));
      return;
    }
    apply(currentValue - 1);
  };

  const handleIncrease = () => {
    if (disabled) return;
    if (!canIncrease) {
      notifyError(t('quantityMax', { max: hasStock ? maxQuantity : 0 }));
      return;
    }
    apply(currentValue + 1);
  };

  const handleInputChange = (e) => {
    // допускаем только цифры, пустая строка — промежуточное состояние ввода
    setDraft(e.target.value.replace(/\D/g, ''));
  };

  const commit = () => {
    if (draft === '') {
      setDraft(String(currentValue));
      return;
    }

    const parsed = Number(draft);

    if (!Number.isInteger(parsed) || parsed < min) {
      notifyError(t('quantityMin', { min }));
      setDraft(String(currentValue));
      return;
    }

    if (parsed > maxQuantity) {
      notifyError(t('quantityMax', { max: hasStock ? maxQuantity : 0 }));
      apply(hasStock ? maxQuantity : currentValue);
      return;
    }

    apply(parsed);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      commit();
      e.currentTarget.blur();
    } else if (e.key === 'Escape') {
      setDraft(String(currentValue));
      e.currentTarget.blur();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      handleIncrease();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      handleDecrease();
    }
  };

  return (
    <div className={`tp-product-quantity ${className}`.trim()} style={wrapperStyle}>
      <span
        className={`tp-cart-minus ${!canDecrease ? 'disabled' : ''}`}
        onClick={handleDecrease}
        style={buttonStyle}
      >
        <Minus />
      </span>
      <input
        className="tp-cart-input"
        type="text"
        inputMode="numeric"
        autoComplete="off"
        aria-label={t('quantity')}
        value={draft}
        disabled={disabled}
        onChange={handleInputChange}
        onBlur={commit}
        onKeyDown={handleKeyDown}
        onFocus={(e) => e.target.select()}
        style={inputStyle}
      />
      <span
        className={`tp-cart-plus ${!canIncrease ? 'disabled' : ''}`}
        onClick={handleIncrease}
        style={buttonStyle}
      >
        <Plus />
      </span>
    </div>
  );
};

export default QuantityInput;
