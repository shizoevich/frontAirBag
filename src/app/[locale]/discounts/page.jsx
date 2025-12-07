'use client';
import React from 'react';
import { useTranslations } from 'next-intl';
import { useGetDiscountsQuery } from '@/redux/features/discountsApi';
import { useGetOrdersQuery } from '@/redux/features/ordersApi';
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

// Mock данные для разработки (используются только если API недоступен)
const MOCK_DISCOUNTS = {
  count: 3,
  results: [
    { id: 1, percentage: "10.00", month_payment: 100000 },  // 1,000 грн - 10%
    { id: 2, percentage: "20.00", month_payment: 200000 },  // 2,000 грн - 20%
    { id: 3, percentage: "30.00", month_payment: 300000 },  // 3,000 грн - 30%
  ]
};

const DiscountsPage = () => {
  const t = useTranslations('Discounts');
  const { data: apiDiscounts, isLoading, isError, error } = useGetDiscountsQuery();
  const { data: ordersData, isLoading: ordersLoading } = useGetOrdersQuery();
  const { user } = useSelector((state) => state.auth);
  
  // Debug logging
  React.useEffect(() => {
    console.log('📊 Discounts API Response:', { 
      data: apiDiscounts, 
      isLoading, 
      isError, 
      error,
      usingMockData: !(apiDiscounts && !isError),
      apiDataType: apiDiscounts ? typeof apiDiscounts : 'undefined',
      apiDataKeys: apiDiscounts ? Object.keys(apiDiscounts) : [],
      resultsCount: apiDiscounts?.results?.length || apiDiscounts?.count || 0
    });
    
    if (apiDiscounts) {
      console.log('📋 API Discounts Details:', apiDiscounts);
      console.log('📋 Results:', apiDiscounts.results || apiDiscounts.data);
    }
  }, [apiDiscounts, isLoading, isError, error]);
  
  // Приоритет: используем данные из API, если они есть
  // Fallback на mock данные только если API недоступен
  const discounts = (apiDiscounts && !isError) ? apiDiscounts : MOCK_DISCOUNTS;
  
  console.log('🎯 Final discounts being used:', {
    source: (apiDiscounts && !isError) ? 'API' : 'MOCK',
    data: discounts,
    resultsCount: discounts?.results?.length || 0
  });
  
  // Вычисляем суммы покупок за текущий и прошлый месяц
  const calculateMonthlySpent = () => {
    if (!ordersData) return { currentMonth: 0, previousMonth: 0, currentDiscount: 0 };
    
    const orders = ordersData.results || ordersData.data || ordersData;
    if (!Array.isArray(orders)) return { currentMonth: 0, previousMonth: 0, currentDiscount: 0 };
    
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-11
    
    // Начало и конец текущего месяца
    const currentMonthStart = new Date(currentYear, currentMonth, 1);
    const currentMonthEnd = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);
    
    // Начало и конец прошлого месяца
    const previousMonthStart = new Date(currentYear, currentMonth - 1, 1);
    const previousMonthEnd = new Date(currentYear, currentMonth, 0, 23, 59, 59);
    
    let currentMonthTotal = 0;
    let previousMonthTotal = 0;
    
    orders
      .filter(order => order.is_paid || order.is_completed)
      .forEach(order => {
        const orderDate = new Date(order.created_at || order.date);
        const orderTotal = (order.grand_total_minor || 0) / 100;
        
        // Проверяем попадает ли заказ в текущий месяц
        if (orderDate >= currentMonthStart && orderDate <= currentMonthEnd) {
          currentMonthTotal += orderTotal;
        }
        
        // Проверяем попадает ли заказ в прошлый месяц
        if (orderDate >= previousMonthStart && orderDate <= previousMonthEnd) {
          previousMonthTotal += orderTotal;
        }
      });
    
    // Определяем текущую скидку на основе суммы прошлого месяца
    const sortedDiscounts = [...(discounts?.results || [])]
      .sort((a, b) => (b.month_payment || 0) - (a.month_payment || 0));
    
    let currentDiscount = 0;
    for (const discount of sortedDiscounts) {
      const threshold = (discount.month_payment || 0) / 100;
      if (previousMonthTotal >= threshold) {
        currentDiscount = parseFloat(discount.percentage);
        break;
      }
    }
    
    console.log('💰 Monthly spent calculation:', {
      currentMonth: {
        start: currentMonthStart.toLocaleDateString('ru-RU'),
        end: currentMonthEnd.toLocaleDateString('ru-RU'),
        total: currentMonthTotal
      },
      previousMonth: {
        start: previousMonthStart.toLocaleDateString('ru-RU'),
        end: previousMonthEnd.toLocaleDateString('ru-RU'),
        total: previousMonthTotal
      },
      currentDiscount: currentDiscount + '%',
      ordersCount: orders.length,
      paidOrders: orders.filter(o => o.is_paid || o.is_completed).length
    });
    
    return { 
      currentMonth: currentMonthTotal, 
      previousMonth: previousMonthTotal,
      currentDiscount 
    };
  };
  
  const { currentMonth: currentMonthSpent, previousMonth: previousMonthSpent, currentDiscount } = calculateMonthlySpent();
  
  // Для прогресс-бара используем сумму текущего месяца
  const userTotalSpent = currentMonthSpent;

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

  // Не блокируем страницу при ошибке API - показываем предупреждение и используем mock данные
  const showApiWarning = isError && error;

  // RTK Query responses are frozen (read-only). Sorting in-place will crash.
  // Make a shallow copy before sort to avoid mutating original data.
  // Если данных нет, используем пустой массив
  const discountsResults = discounts?.results || discounts?.data || [];
  const sortedDiscounts = (Array.isArray(discountsResults) ? [...discountsResults] : [])
    .sort((a, b) => (a?.month_payment || 0) - (b?.month_payment || 0));

  // Prepare milestones data in UAH for progress header
  const milestones = sortedDiscounts.map(d => ({
    amountUAH: (d.month_payment || 0) / 100,
    percentage: parseFloat(d.percentage)
  }));
  const maxMilestone = milestones.length ? milestones[milestones.length - 1].amountUAH : 0;
  const spentRatio = maxMilestone > 0 ? Math.min((userTotalSpent / maxMilestone) * 100, 100) : 0;
  // Find next milestone above current spent
  const nextMilestone = milestones.find(m => userTotalSpent < m.amountUAH);
  const remainingToNext = nextMilestone ? Math.max(nextMilestone.amountUAH - userTotalSpent, 0) : 0;

  return (
    <Wrapper>
      <Header style_2={true} />
      
      <section className="discounts-section py-5">
        <div className="container">
          {/* API Warning - показываем только если используются mock данные */}
          {showApiWarning && (
            <div className="row mb-4">
              <div className="col-12">
                
                  <strong>ℹ️ Демо-режим</strong>
                  <p className="mb-0 mt-2">
                    {error?.status === 404 
                      ? 'API endpoint /api/v2/discounts/ не найден. Показаны демо-данные для примера.' 
                      : error?.status === 401
                      ? 'Требуется авторизация для загрузки скидок. Показаны демо-данные.'
                      : error?.status === 500
                      ? 'Ошибка сервера при загрузке скидок. Показаны демо-данные.'
                      : `Не удалось загрузить скидки (статус: ${error?.status || 'неизвестно'}). Показаны демо-данные.`}
                  </p>
                   </div>
            </div>
          )}
          
          <div className="row">
            <div className="col-12">
              <div className="discounts-header text-center mb-5">
                <h1 className="discounts-title">{t('page_title')}</h1>
                <p className="discounts-subtitle">{t('page_description')}</p>
                
                {user && (
                  <div className="user-stats mt-4 p-4 bg-light rounded border border-primary">
                    <h4 className="mb-3">{t('your_stats')}</h4>
                    
                    {/* Текущая скидка */}
                    {currentDiscount > 0 ? (
                      <div className="alert alert-success mb-3">
                        <strong>🎉 {t('current_discount', { percentage: currentDiscount })}</strong>
                        <p className="mb-0 small mt-1">
                          {t('discount_based_on_previous')}: <strong>{previousMonthSpent.toLocaleString()} ₴</strong>
                        </p>
                      </div>
                    ) : (
                      <div className="alert alert-info mb-3">
                        <strong>{t('no_discount')}</strong>
                      </div>
                    )}
                    
                    {/* Сумма текущего месяца */}
                    <p className="mb-2">
                      <strong>{t('rules_current_month', { amount: currentMonthSpent.toLocaleString() })}</strong>
                    </p>
                    
                    {/* Сумма прошлого месяца */}
                    <p className="mb-0 text-muted small">
                      {t('previous_month_spent')}: {previousMonthSpent.toLocaleString()} ₴
                    </p>
                    
                    {ordersLoading && (
                      <small className="text-muted d-block mt-2">
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Загрузка заказов...
                      </small>
                    )}
                  </div>
                )}

                {/* Milestones progress header */}
                {milestones.length > 0 && (
                  <div className="milestones mt-4 mb-50">
                    <div className="milestones-bar">
                      <div className="milestones-fill" style={{ width: `${spentRatio}%` }} />
                      <div className="milestones-circles">
                        {milestones.map((m, idx) => (
                          <div
                            key={idx}
                            className={`milestone ${userTotalSpent >= m.amountUAH ? 'reached' : ''}`}
                            style={{ left: `${(m.amountUAH / Math.max(maxMilestone, 1)) * 100}%` }}
                            title={`≥ ${m.amountUAH.toLocaleString()} ₴ → ${m.percentage}%`}
                          >
                            <div className="dot" />
                            <div className="label">
                              <span className="amount">{m.amountUAH.toLocaleString()} ₴</span>
                              <span className="percent">{m.percentage}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
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
                <>
                  {/* Rules Section */}
                  <div className="rules-section mb-5">
                    <div className="rules-card">
                      <h2 className="rules-title">
                        <i className="fa fa-info-circle me-2"></i>
                        {t('rules_title')}
                      </h2>
                      
                      <p className="rules-intro">{t('rules_intro')}</p>
                      
                      {/* Информация о текущей скидке */}
                      {currentDiscount > 0 ? (
                        <div className="alert alert-success">
                          <i className="fa fa-check-circle me-2"></i>
                          <strong>{t('your_current_discount')}: {currentDiscount}%</strong>
                          <p className="mb-0 mt-2 small">
                            {t('previous_month_you_spent')} <strong>{previousMonthSpent.toLocaleString()} {t('currency')}</strong>, 
                            {t('so_this_month_discount')} <strong>{currentDiscount}%</strong> {t('on_all_products')}.
                          </p>
                        </div>
                      ) : (
                        <div className="alert alert-info">
                          <i className="fa fa-exclamation-circle me-2"></i>
                          {t('rules_current_status')}
                        </div>
                      )}
                      
                      <p className="rules-description">{t('rules_description')}</p>
                      
                      <ul className="discount-tiers">
                        {sortedDiscounts.map((discount, idx) => {
                          const minAmount = (discount.month_payment / 100).toLocaleString();
                          const nextAmount = sortedDiscounts[idx + 1] 
                            ? (sortedDiscounts[idx + 1].month_payment / 100).toLocaleString()
                            : null;
                          const isActive = userTotalSpent >= (discount.month_payment / 100);
                          
                          return (
                            <li key={discount.id} className={isActive ? 'active-tier' : ''}>
                              <span className="tier-icon">
                                {isActive ? <i className="fa fa-check-circle me-2"></i> : <i className="fas fa-exclamation-triangle me-2" style={{ fontSize: '16px' }}></i>}
                              </span>
                              <span className="tier-text">
                                {t('from')} {minAmount} {nextAmount ? `${t('to')} ${nextAmount}` : t('and_more')} {t('currency')} — <strong>{parseFloat(discount.percentage)}%</strong>
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                      
                      
                    </div>
                  </div>

                  
                   
                </>
              )}
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
      
      <style jsx>{`
        .discounts-section {
          min-height: 60vh;
          background: linear-gradient(135deg, #f8f9fa 0%,rgb(239, 236, 233) 100%);
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
          max-width: 600px;
          margin: 0 auto;
          border: 2px solidrgb(210, 144, 58);
        }

        /* Milestones progress header */
        .milestones { text-align: left; }
        .milestones-bar {
          position: relative;
          height: 10px;
          background:rgb(164, 164, 164);
          border-radius: 6px;
          overflow: visible;
          margin-top: 18px;
          max-width: 600px;


          margin-left: auto;
          margin-right: auto;
        }
        .milestones-fill {
          position: absolute;
          left: 0; top: 0; bottom: 0;
          background: linear-gradient(90deg,rgb(253, 197, 13),rgb(185, 23, 23));
          border-radius: 6px;
          transition: width 0.3s ease;
        }
        .milestones-circles {
          position: relative;
          height: 0;
        }
        .milestone {
          position: absolute;
          top: -10px;
          transform: translateX(-50%);
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .milestone .dot {
          width: 16px; height: 16px; border-radius: 50%;
          background: #fff; border: 3px solidrgb(125, 113, 108);
          box-shadow: 0 0 0 2px #000;
        }
        .milestone.reached .dot { border-color:rgb(217, 112, 8); }
        .milestone .label {
          margin-top: 6px;
          display: flex; gap: 6px;
          background: rgba(255,255,255,0.9);
          border: 1px solidrgb(239, 236, 233);
          border-radius: 6px;
          padding: 4px 8px;
          white-space: nowrap;
        }
        .milestone .label .amount { color:rgb(87, 83, 73); font-size: 12px; }
        .milestone .label .percent { color:rgb(253, 113, 13); font-weight: 600; font-size: 12px; }
        
        /* Rules Section Styles */
        .rules-section {
          margin-bottom: 40px;
        }
        
        .rules-card {
          background: #fff;
          border-radius: 16px;
          padding: 32px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          border: 2px solid #e9ecef;
        }
        
        .rules-title {
          font-size: 24px;
          font-weight: 700;
          color:rgb(253, 137, 13);
          margin-bottom: 20px;
          display: flex;
          align-items: center;
        }
        
        .rules-intro {
          font-size: 16px;
          color:rgb(87, 81, 73);
          margin-bottom: 16px;
          line-height: 1.6;
        }
        
        .rules-current-month {
          font-size: 16px;
          font-weight: 600;
          color:rgb(211, 102, 29);
          margin-bottom: 20px;
          padding: 12px;
          background:rgb(231, 226, 209);
          border-radius: 8px;
          border-left: 4px solidrgb(150, 47, 10);
        }
        
        .rules-description {
          font-size: 15px;
          color:rgb(87, 79, 73);
          margin-bottom: 16px;
          font-weight: 500;
        }
        
        .discount-tiers {
          list-style: none;
          padding: 0;
          margin: 20px 0;
        }
        
        .discount-tiers li {
          padding: 12px 16px;
          margin-bottom: 10px;
          background:rgb(250, 249, 248);
          border-radius: 8px;
          border-left: 4px solidrgb(189, 144, 78);
          display: flex;
          align-items: center;
          transition: all 0.3s ease;
        }
        
        .discount-tiers li.active-tier {
          background:rgb(248, 225, 191);
          border-left-color:rgb(223, 106, 34);
          box-shadow: 0 2px 8px rgba(135, 84, 25, 0.2);
        }
        
        .tier-icon {
          font-size: 18px;
          margin-right: 12px;
        }
        
        .tier-text {
          font-size: 15px;
          color:rgb(87, 80, 73);
        }
        
        .tier-text strong {
          color:rgb(253, 133, 13);
          font-size: 16px;
        }
        
        .rules-calculation {
          margin-top: 24px;
          padding: 20px;
          background: #fff3cd;
          border-radius: 8px;
          border-left: 4px solid #ffc107;
        }
        
        .rules-calculation h4 {
          font-size: 18px;
          font-weight: 600;
          color: #856404;
          margin-bottom: 12px;
        }
        
        .rules-calculation ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        
        .rules-calculation li {
          padding: 8px 0;
          color: #856404;
          font-size: 14px;
        }
        
        .rules-footer {
          margin-top: 24px;
          padding: 16px;
          background: #e7f3ff;
          border-radius: 8px;
          color:rgb(133, 60, 0);
          font-size: 14px;
          font-style: italic;
          text-align: center;
          border: 1px solidrgb(255, 220, 184);
        }
        
        @media (max-width: 768px) {
          .discounts-title {
            font-size: 2rem;
          }
          
          .discounts-subtitle {
            font-size: 1rem;
          }
          
          .milestone .label { font-size: 11px; }
          
          .rules-card {
            padding: 20px;
          }
          
          .rules-title {
            font-size: 20px;
          }
          
          .discount-tiers li {
            padding: 10px 12px;
            font-size: 14px;
          }
          
          .tier-text {
            font-size: 14px;
          }
          
          .rules-calculation {
            padding: 16px;
          }
          
          .rules-calculation h4 {
            font-size: 16px;
          }
        }
      `}</style>
    </Wrapper>
  );
};

export default DiscountsPage;
