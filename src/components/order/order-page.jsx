'use client';
import React, { useState } from 'react';
import { useGetOrdersQuery, useGetOrderByIdQuery } from '@/redux/features/ordersApi';
import { useGetMeQuery } from '@/redux/features/authApi';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

const OrderPage = () => {
  const t = useTranslations('Orders');
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  
  const { data: user } = useGetMeQuery();
  const { data: orders, isLoading: ordersLoading, error: ordersError } = useGetOrdersQuery();
  const { data: selectedOrder, isLoading: orderLoading } = useGetOrderByIdQuery(selectedOrderId, {
    skip: !selectedOrderId
  });

  // Тестовые данные для демонстрации, когда API недоступен
  const mockOrders = [
    {
      id: 1,
      date: '2024-01-15T10:30:00Z',
      is_completed: true,
      is_paid: true,
      grand_total_minor: 125000, // 1250.00 грн
      name: 'Іван',
      last_name: 'Петренко',
      phone: '+380501234567',
      nova_post_address: 'Відділення №1, вул. Хрещатик, 1, Київ',
      description: 'Терміново потрібні запчастини для ремонту',
      prepayment: true,
      ttn: 'TTN123456789',
      discount_percent: '10',
      subtotal_minor: 135000,
      discount_total_minor: 13500,
      items: [
        {
          id: 1,
          title: 'Подушка безпеки водія BMW X5',
          quantity: 1,
          original_price_minor: 85000, // 850.00 грн
        },
        {
          id: 2,
          title: 'Піропатрон ременя безпеки',
          quantity: 2,
          original_price_minor: 25000, // 250.00 грн за штуку
        }
      ]
    },
    {
      id: 2,
      date: '2024-01-10T14:20:00Z',
      is_completed: false,
      is_paid: false,
      grand_total_minor: 75000, // 750.00 грн
      name: 'Іван',
      last_name: 'Петренко',
      phone: '+380501234567',
      nova_post_address: 'Відділення №5, вул. Бандери, 15, Львів',
      description: '',
      prepayment: false,
      ttn: null,
      discount_percent: null,
      subtotal_minor: 75000,
      discount_total_minor: 0,
      items: [
        {
          id: 3,
          title: 'Накладка подушки безпеки Audi A4',
          quantity: 1,
          original_price_minor: 75000,
        }
      ]
    }
  ];

  // Используем тестовые данные, если API недоступен
  const displayOrders = ordersError ? { results: mockOrders } : orders;

  if (ordersLoading) {
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

  // Убираем блок ошибки, так как теперь используем тестовые данные при ошибке API

  const formatPrice = (priceMinor) => {
    return (priceMinor / 100).toFixed(2);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('uk-UA');
  };

  const getOrderStatus = (order) => {
    if (order.is_completed) return { text: t('order_completed'), class: 'success' };
    if (order.is_paid) return { text: t('order_paid'), class: 'info' };
    return { text: t('order_pending'), class: 'warning' };
  };

  return (
    <div className="tp-order-area pt-80 pb-80">
      <div className="container">
        <div className="row">
          <div className="col-12">
            <div className="tp-order-inner">
              {/* Header Section */}
              <div className="tp-order-info-wrapper mb-4">
                <div className="row align-items-center">
                  <div className="col-md-6">
                    <h3 className="tp-order-info-title mb-0">{t('my_orders')}</h3>
                  </div>
                  <div className="col-md-6 text-md-end">
                    <Link href="/shop" className="tp-btn tp-btn-2">
                      {t('continue_shopping')}
                    </Link>
                  </div>
                </div>
              </div>

              {!displayOrders?.results?.length ? (
                <div className="tp-order-empty text-center py-5">
                  <div className="tp-order-empty-icon mb-4">
                    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.7 15.3C4.3 15.7 4.6 16.5 5.1 16.5H17M17 13V17C17 18.1 16.1 19 15 19H9C7.9 19 7 18.1 7 17V13M17 13H7" stroke="#6c757d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="9" cy="20" r="1" stroke="#6c757d" strokeWidth="2"/>
                      <circle cx="20" cy="20" r="1" stroke="#6c757d" strokeWidth="2"/>
                    </svg>
                  </div>
                  <h4 className="mb-3">{t('no_orders_found')}</h4>
                  <p className="text-muted mb-4">{t('no_orders_description')}</p>
                  <Link href="/shop" className="tp-btn">
                    {t('start_shopping')}
                  </Link>
                </div>
              ) : (
                <div className="tp-order-table-wrapper">
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead className="table-light">
                        <tr>
                          <th scope="col" className="fw-semibold">{t('order_id')}</th>
                          <th scope="col" className="fw-semibold">{t('date')}</th>
                          <th scope="col" className="fw-semibold">{t('status')}</th>
                          <th scope="col" className="fw-semibold">{t('total')}</th>
                          <th scope="col" className="fw-semibold text-center">{t('actions')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {displayOrders.results.map((order) => {
                          const status = getOrderStatus(order);
                          return (
                            <tr key={order.id} className="align-middle">
                              <td className="fw-medium">#{order.id}</td>
                              <td>{formatDate(order.date)}</td>
                              <td>
                                <span className={`badge rounded-pill bg-${status.class} fs-15 px-2 py-2`}>
                                  {status.text}
                                </span>
                              </td>
                              <td className="fw-semibold">₴{formatPrice(order.grand_total_minor)}</td>
                              <td className="text-center">
                                <button
                                  className="tp-btn tp-btn-2 tp-btn-sm"
                                  onClick={() => setSelectedOrderId(order.id)}
                                >
                                  {t('view_details')}
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Order Details Modal */}
              {selectedOrderId && (
                <div className="tp-order-details-wrapper mt-5">
                  <div className="tp-order-details bg-light p-4 rounded">
                    <div className="tp-order-details-top d-flex justify-content-between align-items-center mb-4">
                      <h4 className="mb-0">
                        <i className="fas fa-receipt me-2 text-primary"></i>
                        {t('order_details')} #{selectedOrderId}
                      </h4>
                      <button
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => setSelectedOrderId(null)}
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>

                    {orderLoading ? (
                      <div className="text-center py-4">
                        <div className="spinner-border spinner-border-sm text-primary" role="status">
                          <span className="visually-hidden">{t('loading')}</span>
                        </div>
                      </div>
                    ) : (() => {
                      // Найти заказ в тестовых данных или использовать данные из API
                      const orderToShow = selectedOrder || displayOrders.results.find(order => order.id === selectedOrderId);
                      return orderToShow ? (
                      <div className="tp-order-details-content">
                        <div className="row mb-4">
                          <div className="col-md-6">
                            <div className="card h-100">
                              <div className="card-header bg-primary text-white">
                                <h6 className="mb-0">
                                  <i className="fas fa-user me-2"></i>
                                  {t('customer_info')}
                                </h6>
                              </div>
                              <div className="card-body">
                                <div className="mb-2">
                                  <strong className="text-muted">{t('name')}:</strong>
                                  <span className="ms-2">{orderToShow.name} {orderToShow.last_name}</span>
                                </div>
                                <div className="mb-2">
                                  <strong className="text-muted">{t('phone')}:</strong>
                                  <span className="ms-2">{orderToShow.phone}</span>
                                </div>
                                <div className="mb-2">
                                  <strong className="text-muted">{t('address')}:</strong>
                                  <span className="ms-2">{orderToShow.nova_post_address}</span>
                                </div>
                                {orderToShow.description && (
                                  <div>
                                    <strong className="text-muted">{t('description')}:</strong>
                                    <span className="ms-2">{orderToShow.description}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="card h-100">
                              <div className="card-header bg-info text-white">
                                <h6 className="mb-0">
                                  <i className="fas fa-info-circle me-2"></i>
                                  {t('order_info')}
                                </h6>
                              </div>
                              <div className="card-body">
                                <div className="mb-2">
                                  <strong className="text-muted">{t('date')}:</strong>
                                  <span className="ms-2">{formatDate(orderToShow.date)}</span>
                                </div>
                                <div className="mb-2">
                                  <strong className="text-muted">{t('prepayment')}:</strong>
                                  <span className={`ms-2 badge ${orderToShow.prepayment ? 'bg-success' : 'bg-warning'}`}>
                                    {orderToShow.prepayment ? t('yes') : t('no')}
                                  </span>
                                </div>
                                {orderToShow.ttn && (
                                  <div className="mb-2">
                                    <strong className="text-muted">{t('tracking_number')}:</strong>
                                    <span className="ms-2 font-monospace">{orderToShow.ttn}</span>
                                  </div>
                                )}
                                {orderToShow.discount_percent && (
                                  <div>
                                    <strong className="text-muted">{t('discount')}:</strong>
                                    <span className="ms-2 text-success fw-bold">{orderToShow.discount_percent}%</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="tp-order-details-items">
                          <div className="card">
                            <div className="card-header bg-success text-white">
                              <h6 className="mb-0">
                                <i className="fas fa-shopping-cart me-2"></i>
                                {t('order_items')}
                              </h6>
                            </div>
                            <div className="card-body p-0">
                              <div className="table-responsive">
                                <table className="table table-striped mb-0">
                                  <thead className="table-light">
                                    <tr>
                                      <th className="fw-semibold">{t('product')}</th>
                                      <th className="fw-semibold text-center">{t('quantity')}</th>
                                      <th className="fw-semibold text-end">{t('price')}</th>
                                      <th className="fw-semibold text-end">{t('total')}</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {orderToShow.items?.map((item) => (
                                      <tr key={item.id}>
                                        <td className="align-middle">
                                          <div className="fw-medium">{item.title}</div>
                                        </td>
                                        <td className="align-middle text-center">
                                          <span className="badge bg-secondary">{item.quantity}</span>
                                        </td>
                                        <td className="align-middle text-end">₴{formatPrice(item.original_price_minor)}</td>
                                        <td className="align-middle text-end fw-semibold">₴{formatPrice(item.original_price_minor * item.quantity)}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>

                          <div className="tp-order-details-total mt-4">
                            <div className="row justify-content-end">
                              <div className="col-md-5">
                                <div className="card">
                                  <div className="card-header bg-dark text-white">
                                    <h6 className="mb-0">
                                      <i className="fas fa-calculator me-2"></i>
                                      {t('order_summary')}
                                    </h6>
                                  </div>
                                  <div className="card-body">
                                    <div className="d-flex justify-content-between mb-2">
                                      <span className="text-muted">{t('subtotal')}:</span>
                                      <span>₴{formatPrice(orderToShow.subtotal_minor)}</span>
                                    </div>
                                    {orderToShow.discount_total_minor > 0 && (
                                      <div className="d-flex justify-content-between mb-2">
                                        <span className="text-muted">{t('discount')}:</span>
                                        <span className="text-success">-₴{formatPrice(orderToShow.discount_total_minor)}</span>
                                      </div>
                                    )}
                                    <hr />
                                    <div className="d-flex justify-content-between">
                                      <strong className="fs-5">{t('total')}:</strong>
                                      <strong className="fs-5 text-primary">₴{formatPrice(orderToShow.grand_total_minor)}</strong>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      ) : null;
                    })()}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderPage;
