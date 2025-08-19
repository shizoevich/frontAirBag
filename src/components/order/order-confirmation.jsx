'use client';
import React from 'react';
import { useGetOrderByIdQuery } from '@/redux/features/ordersApi';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

const OrderConfirmation = ({ orderId }) => {
  const t = useTranslations('Orders');
  const { data: order, isLoading, error } = useGetOrderByIdQuery(orderId);

  // Тестовые данные для демонстрации
  const mockOrder = {
    id: orderId,
    date: new Date().toISOString(),
    name: 'Іван',
    last_name: 'Петренко',
    phone: '+380501234567',
    nova_post_address: 'Відділення №1, вул. Хрещатик, 1, Київ',
    prepayment: false,
    grand_total_minor: 125000,
    items: [
      {
        id: 1,
        title: 'Подушка безпеки водія BMW X5',
        quantity: 1,
        original_price_minor: 85000,
      }
    ]
  };

  const displayOrder = order || mockOrder;

  const formatPrice = (priceMinor) => {
    return (priceMinor / 100).toFixed(2);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('uk-UA');
  };

  if (isLoading) {
    return (
      <div className="container">
        <div className="row">
          <div className="col-12">
            <div className="text-center py-5">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">{t('loading')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="tp-order-confirmation-area pt-80 pb-80">
      <div className="container">
        <div className="row">
          <div className="col-12">
            <div className="tp-order-confirmation-wrapper">
              <div className="tp-order-confirmation-header text-center mb-5">
                <div className="tp-order-confirmation-icon mb-3">
                  <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" fill="#28a745"/>
                    <path d="m9 12 2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h2 className="tp-order-confirmation-title">{t('order_confirmed')}</h2>
                <p className="tp-order-confirmation-subtitle">
                  {t('order_confirmation_message')}
                </p>
              </div>

              <div className="tp-order-confirmation-details">
                <div className="row">
                  <div className="col-md-6">
                    <div className="tp-order-confirmation-info">
                      <h4>{t('order_details')}</h4>
                      <p><strong>{t('order_id')}:</strong> #{displayOrder.id}</p>
                      <p><strong>{t('date')}:</strong> {formatDate(displayOrder.date)}</p>
                      <p><strong>{t('total')}:</strong> ₴{formatPrice(displayOrder.grand_total_minor)}</p>
                      <p><strong>{t('payment_method')}:</strong> {displayOrder.prepayment ? t('pay_now') : t('cash_on_delivery')}</p>
                    </div>
                  </div>
                  
                  <div className="col-md-6">
                    <div className="tp-order-confirmation-delivery">
                      <h4>{t('delivery_info')}</h4>
                      <p><strong>{t('name')}:</strong> {displayOrder.name} {displayOrder.last_name}</p>
                      <p><strong>{t('phone')}:</strong> {displayOrder.phone}</p>
                      <p><strong>{t('address')}:</strong> {displayOrder.nova_post_address}</p>
                    </div>
                  </div>
                </div>

                <div className="tp-order-confirmation-items mt-4">
                  <h4>{t('order_items')}</h4>
                  <div className="table-responsive">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>{t('product')}</th>
                          <th>{t('quantity')}</th>
                          <th>{t('price')}</th>
                          <th>{t('total')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {displayOrder.items?.map((item) => (
                          <tr key={item.id}>
                            <td>{item.title}</td>
                            <td>{item.quantity}</td>
                            <td>₴{formatPrice(item.original_price_minor)}</td>
                            <td>₴{formatPrice(item.original_price_minor * item.quantity)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="tp-order-confirmation-actions text-center mt-5">
                  <div className="tp-order-confirmation-buttons">
                    <Link href="/orders" className="tp-btn tp-btn-2 me-3">
                      {t('view_all_orders')}
                    </Link>
                    <Link href="/shop" className="tp-btn">
                      {t('continue_shopping')}
                    </Link>
                  </div>
                  
                  <div className="tp-order-confirmation-note mt-4">
                    <p className="text-muted">
                      {displayOrder.prepayment 
                        ? t('payment_confirmation_note')
                        : t('cash_delivery_note')
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
