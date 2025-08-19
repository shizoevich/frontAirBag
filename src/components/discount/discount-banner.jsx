import React from 'react';
import { useGetDiscountsQuery } from '@/redux/features/discountsApi';
import { useTranslations } from 'next-intl';

const DiscountBanner = () => {
  const t = useTranslations('Discounts');
  const { data: discounts, isLoading, error } = useGetDiscountsQuery();

  if (isLoading) return null;
  
  // Если нет скидок из API, используем заглушку
  const activeDiscount = discounts?.results?.[0] || {
    percentage: '15',
    month_payment: 50000 // 500.00 в минорных единицах
  };

  return (
    <div className="tp-header-top-2 p-relative z-index-11 d-none d-md-block">
      <div className="container-fluid">
        <div className="row">
          <div className="col-md-12">
            <div className="tp-header-top-inner-2 d-flex align-items-center justify-content-center">
              <div className="tp-header-top-info d-flex align-items-center">
                <div className="tp-header-top-info-item">
                  <span className="tp-header-top-info-item-text">
                    🎉 {t('discount_banner_text', { 
                      percentage: activeDiscount.percentage,
                      monthPayment: (activeDiscount.month_payment / 100).toFixed(2)
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiscountBanner;
