'use client';
import React from 'react';
import { useTranslations } from 'next-intl';
import { useGetDiscountsQuery } from '@/redux/features/discountsApi';
import { useSelector } from 'react-redux';
import Wrapper from '@/layout/wrapper';
import Header from '@/layout/headers/header';
import Footer from '@/layout/footers/footer';

// Компонент для отображения одной скидки
const DiscountCard = ({ discount, userTotalSpent, t }) => {
  const isEligible = userTotalSpent >= (discount.month_payment / 100); // конвертируем из копеек в гривны
  const percentage = parseFloat(discount.percentage);

  return (
    <div className={`discount-card ${isEligible ? 'eligible' : 'not-eligible'}`}>
      <div className="discount-header">
        <div className="discount-percentage">
          {percentage}%
        </div>
        <div className="discount-status">
          {isEligible ? (
            <span className="status-available">{t('available')}</span>
          ) : (
            <span className="status-locked">{t('locked')}</span>
          )}
        </div>
      </div>
      
      <div className="discount-body">
        <h3 className="discount-title">
          {t('discount_title', { percentage: percentage })}
        </h3>
        <p className="discount-description">
          {t('discount_description', { percentage: percentage })}
        </p>
        
        <div className="discount-requirement">
          <p className="requirement-text">
            {t('requirement_text')}: <strong>{(discount.month_payment / 100).toLocaleString()} ₴</strong>
          </p>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ 
                width: `${Math.min((userTotalSpent / (discount.month_payment / 100)) * 100, 100)}%` 
              }}
            ></div>
          </div>
          <p className="progress-text">
            {isEligible ? (
              <span className="text-success">{t('requirement_met')}</span>
            ) : (
              <span className="text-muted">
                {t('need_more', { 
                  amount: ((discount.month_payment / 100) - userTotalSpent).toLocaleString() 
                })} ₴
              </span>
            )}
          </p>
        </div>
      </div>

      <style jsx>{`
        .discount-card {
          background: #fff;
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 20px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
          border: 2px solid transparent;
        }
        
        .discount-card.eligible {
          border-color: #28a745;
          box-shadow: 0 4px 20px rgba(40, 167, 69, 0.2);
        }
        
        .discount-card.not-eligible {
          border-color: #e9ecef;
          opacity: 0.8;
        }
        
        .discount-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }
        
        .discount-percentage {
          font-size: 36px;
          font-weight: bold;
          color: #007bff;
        }
        
        .status-available {
          background: #28a745;
          color: white;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
        }
        
        .status-locked {
          background: #6c757d;
          color: white;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
        }
        
        .discount-title {
          font-size: 20px;
          font-weight: 600;
          margin-bottom: 8px;
          color: #333;
        }
        
        .discount-description {
          color: #666;
          margin-bottom: 16px;
          line-height: 1.5;
        }
        
        .requirement-text {
          font-size: 14px;
          margin-bottom: 8px;
          color: #555;
        }
        
        .progress-bar {
          width: 100%;
          height: 8px;
          background: #e9ecef;
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 8px;
        }
        
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #007bff, #28a745);
          transition: width 0.3s ease;
        }
        
        .progress-text {
          font-size: 12px;
          margin: 0;
        }
        
        .text-success {
          color: #28a745;
          font-weight: 600;
        }
        
        .text-muted {
          color: #6c757d;
        }
      `}</style>
    </div>
  );
};

const DiscountsPage = () => {
  const t = useTranslations('Discounts');
  const { data: discounts, isLoading, isError } = useGetDiscountsQuery();
  const { user } = useSelector((state) => state.auth);
  
  // Здесь нужно будет получить общую сумму покупок пользователя
  // Пока используем заглушку
  const userTotalSpent = user?.total_spent || 0;

  if (isLoading) {
    return (
      <Wrapper>
        <Header style_2={true} />
        <div className="container py-5">
          <div className="text-center">
            <div className="spinner-border" role="status">
              <span className="sr-only">{t('loading')}</span>
            </div>
          </div>
        </div>
        <Footer />
      </Wrapper>
    );
  }

  if (isError) {
    return (
      <Wrapper>
        <Header style_2={true} />
        <div className="container py-5">
          <div className="alert alert-danger text-center">
            {t('error_loading')}
          </div>
        </div>
        <Footer />
      </Wrapper>
    );
  }

  const sortedDiscounts = discounts?.results?.sort((a, b) => a.month_payment - b.month_payment) || [];

  return (
    <Wrapper>
      <Header style_2={true} />
      
      <section className="discounts-section py-5">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <div className="discounts-header text-center mb-5">
                <h1 className="discounts-title">{t('page_title')}</h1>
                <p className="discounts-subtitle">{t('page_description')}</p>
                
                {user && (
                  <div className="user-stats mt-4 p-4 bg-light rounded">
                    <h4>{t('your_stats')}</h4>
                    <p className="mb-0">
                      {t('total_spent')}: <strong>{userTotalSpent.toLocaleString()} ₴</strong>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="row">
            <div className="col-lg-8 mx-auto">
              {sortedDiscounts.length === 0 ? (
                <div className="text-center py-5">
                  <h3>{t('no_discounts')}</h3>
                  <p className="text-muted">{t('no_discounts_description')}</p>
                </div>
              ) : (
                sortedDiscounts.map((discount) => (
                  <DiscountCard
                    key={discount.id}
                    discount={discount}
                    userTotalSpent={userTotalSpent}
                    t={t}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
      
      <style jsx>{`
        .discounts-section {
          min-height: 60vh;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        }
        
        .discounts-title {
          font-size: 2.5rem;
          font-weight: 700;
          color: #333;
          margin-bottom: 1rem;
        }
        
        .discounts-subtitle {
          font-size: 1.1rem;
          color: #666;
          max-width: 600px;
          margin: 0 auto;
        }
        
        .user-stats {
          max-width: 400px;
          margin: 0 auto;
          border: 2px solid #007bff;
        }
        
        @media (max-width: 768px) {
          .discounts-title {
            font-size: 2rem;
          }
          
          .discounts-subtitle {
            font-size: 1rem;
          }
        }
      `}</style>
    </Wrapper>
  );
};

export default DiscountsPage;
