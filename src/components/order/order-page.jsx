'use client';
import React, { useState } from 'react';
import { useGetOrdersQuery, useGetOrderByIdQuery } from '@/redux/features/ordersApi';
import { useSelector } from 'react-redux';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

const OrderPage = () => {
  const t = useTranslations('Orders');
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  
  // Получаем данные пользователя из Redux (не вызываем /auth/me/)
  const { user } = useSelector((state) => state.auth);
  const { data: orders, isLoading: ordersLoading, error: ordersError } = useGetOrdersQuery();
  const { data: selectedOrder, isLoading: orderLoading } = useGetOrderByIdQuery(selectedOrderId, {
    skip: !selectedOrderId
  });

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
                          <span className="visually-hidden">Завантаження...</span>
                        </div>
                        <p className="mt-2 small">{t('loading')}</p>
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
            
  ;
};

export default OrderPage;
