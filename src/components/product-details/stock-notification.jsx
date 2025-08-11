'use client';
import React from 'react';
import { useTranslations } from 'next-intl';

const StockNotification = ({ availableQuantity, requestedQuantity }) => {
  const t = useTranslations('ProductDetails');
  
  return (
    <div className="tp-product-stock-notification mb-15">
      {availableQuantity <= 0 ? (
        <div className="tp-product-stock-error">
          <span className="text-danger">
            <i className="fa-solid fa-circle-exclamation me-1"></i>
            {t('outOfStock')}
          </span>
        </div>
      ) : requestedQuantity > availableQuantity ? (
        <div className="tp-product-stock-warning">
          <span className="text-warning">
            <i className="fa-solid fa-triangle-exclamation me-1"></i>
            {t('availableItems', { count: availableQuantity })}
          </span>
        </div>
      ) : (
        <div className="tp-product-stock-success">
          <span className="text-success">
            <i className="fa-solid fa-check-circle me-1"></i>
            {t('availableItems', { count: availableQuantity })}
          </span>
        </div>
      )}
    </div>
  );
};

export default StockNotification;
