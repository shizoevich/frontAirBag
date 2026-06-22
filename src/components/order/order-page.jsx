'use client';
import React, { useMemo, useState } from 'react';
import { useGetOrdersQuery, useGetOrderByIdQuery } from '@/redux/features/ordersApi';
import { useSelector } from 'react-redux';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';

// AIRBAG-88: подписи фильтров/служебные — инлайн по локали (без правки messages).
const L = {
  uk: {
    filters: 'Фільтри', dateFrom: 'Дата від', dateTo: 'Дата до', allStatuses: 'Усі статуси',
    search: 'Пошук за №', reset: 'Скинути', loadMore: 'Показати ще',
    found: 'Знайдено', ordersWord: 'замовлень', sumWord: 'на суму',
    statusPending: 'В обробці', statusPaid: 'Оплачено', statusCompleted: 'Виконано', close: 'Закрити',
  },
  ru: {
    filters: 'Фильтры', dateFrom: 'Дата от', dateTo: 'Дата до', allStatuses: 'Все статусы',
    search: 'Поиск по №', reset: 'Сбросить', loadMore: 'Показать ещё',
    found: 'Найдено', ordersWord: 'заказов', sumWord: 'на сумму',
    statusPending: 'В обработке', statusPaid: 'Оплачено', statusCompleted: 'Выполнено', close: 'Закрыть',
  },
};

const PAGE_SIZE = 20;

const OrderPage = () => {
  const t = useTranslations('Orders');
  const locale = useLocale();
  const l = L[locale] || L.uk;
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  // фильтры/сортировка/пагинация — клиентские (заказы уже загружены)
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const { user } = useSelector((state) => state.auth);
  const { data: orders, isLoading: ordersLoading, error: ordersError } = useGetOrdersQuery(user?.id);
  const { data: selectedOrder, isLoading: orderLoading } = useGetOrderByIdQuery(selectedOrderId, {
    skip: !selectedOrderId,
  });

  const displayOrders = useMemo(() => {
    const results = orders?.results || orders?.data || orders || [];
    return Array.isArray(results) ? results : [];
  }, [orders]);

  const formatPrice = (priceMinor) => (Number(priceMinor || 0) / 100).toFixed(2);

  const getOrderTotal = (order) => {
    if (order?.grand_total_minor > 0) return order.grand_total_minor;
    if (order?.items?.length > 0) {
      return order.items.reduce((sum, item) => sum + (item.original_price_minor || 0) * (item.quantity || 1), 0);
    }
    return 0;
  };

  const formatDate = (dateString) => (dateString ? new Date(dateString).toLocaleDateString('uk-UA') : '');

  const statusOf = (order) => (order?.is_completed ? 'completed' : order?.is_paid ? 'paid' : 'pending');
  const renderStatus = (order) => {
    const s = statusOf(order);
    return s === 'completed' ? l.statusCompleted : s === 'paid' ? l.statusPaid : l.statusPending;
  };
  const statusBadgeClass = (order) => {
    const s = statusOf(order);
    return s === 'completed' ? 'bg-success' : s === 'paid' ? 'bg-info' : 'bg-secondary';
  };

  // AIRBAG-88: сортировка по дате (новые сверху) + фильтры
  const filteredOrders = useMemo(() => {
    let arr = [...displayOrders].sort((a, b) => new Date(b.date) - new Date(a.date));
    if (search.trim()) arr = arr.filter((o) => String(o.id).includes(search.trim()));
    if (statusFilter !== 'all') arr = arr.filter((o) => statusOf(o) === statusFilter);
    if (dateFrom) arr = arr.filter((o) => new Date(o.date) >= new Date(dateFrom));
    if (dateTo) {
      const end = new Date(dateTo);
      end.setHours(23, 59, 59, 999);
      arr = arr.filter((o) => new Date(o.date) <= end);
    }
    return arr;
  }, [displayOrders, search, statusFilter, dateFrom, dateTo]);

  const visibleOrders = filteredOrders.slice(0, visibleCount);
  const filteredSum = filteredOrders.reduce((s, o) => s + getOrderTotal(o), 0);

  const resetFilters = () => {
    setDateFrom(''); setDateTo(''); setStatusFilter('all'); setSearch(''); setVisibleCount(PAGE_SIZE);
  };

  const orderToShow = selectedOrder || displayOrders.find((o) => o.id === selectedOrderId);

  return (
    <div className="tp-order-area pt-80 pb-80">
      <div className="container">
        <div className="row">
          <div className="col-12">
            <h3 className="mb-4">{t('my_orders')}</h3>

            {ordersLoading && (
              <div className="text-center py-5">
                <div className="spinner-border" role="status"><span className="visually-hidden">Loading...</span></div>
                <p className="mt-3">{t('loading')}</p>
              </div>
            )}

            {!ordersLoading && ordersError && (
              <div className="alert alert-danger">{t('error_loading_orders')}</div>
            )}

            {!ordersLoading && !ordersError && displayOrders.length === 0 && (
              <div className="text-center py-5">
                <h4>{t('no_orders_found')}</h4>
                <p className="mb-4">{t('no_orders_description')}</p>
                <Link href={`/${locale}`} className="tp-btn">{t('start_shopping')}</Link>
              </div>
            )}

            {!ordersLoading && !ordersError && displayOrders.length > 0 && (
              <>
                {/* Фильтры */}
                <div className="card mb-3">
                  <div className="card-body">
                    <div className="row g-2 align-items-end">
                      <div className="col-6 col-md-3">
                        <label className="form-label small text-muted mb-1">{l.dateFrom}</label>
                        <input type="date" className="form-control form-control-sm" value={dateFrom}
                          onChange={(e) => { setDateFrom(e.target.value); setVisibleCount(PAGE_SIZE); }} />
                      </div>
                      <div className="col-6 col-md-3">
                        <label className="form-label small text-muted mb-1">{l.dateTo}</label>
                        <input type="date" className="form-control form-control-sm" value={dateTo}
                          onChange={(e) => { setDateTo(e.target.value); setVisibleCount(PAGE_SIZE); }} />
                      </div>
                      <div className="col-6 col-md-2">
                        <label className="form-label small text-muted mb-1">{t('status')}</label>
                        <select className="form-select form-select-sm" value={statusFilter}
                          onChange={(e) => { setStatusFilter(e.target.value); setVisibleCount(PAGE_SIZE); }}>
                          <option value="all">{l.allStatuses}</option>
                          <option value="pending">{l.statusPending}</option>
                          <option value="paid">{l.statusPaid}</option>
                          <option value="completed">{l.statusCompleted}</option>
                        </select>
                      </div>
                      <div className="col-6 col-md-2">
                        <label className="form-label small text-muted mb-1">{l.search}</label>
                        <input type="text" inputMode="numeric" className="form-control form-control-sm" value={search}
                          onChange={(e) => { setSearch(e.target.value); setVisibleCount(PAGE_SIZE); }} placeholder="#" />
                      </div>
                      <div className="col-12 col-md-2">
                        <button type="button" className="btn btn-outline-secondary btn-sm w-100" onClick={resetFilters}>{l.reset}</button>
                      </div>
                    </div>
                    {/* Подытог отфильтрованного */}
                    <div className="mt-3 small">
                      <span className="text-muted">{l.found}:</span>{' '}
                      <strong>{filteredOrders.length}</strong> {l.ordersWord}{' '}
                      <span className="text-muted">{l.sumWord}</span>{' '}
                      <strong className="text-primary">₴{formatPrice(filteredSum)}</strong>
                    </div>
                  </div>
                </div>

                {/* Скролл-таблица со sticky-заголовком */}
                <div style={{ maxHeight: '60vh', overflowY: 'auto', border: '1px solid #e6eaf0', borderRadius: 8 }}>
                  <table className="table table-striped mb-0">
                    <thead className="table-light" style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                      <tr>
                        <th>{t('orderNumber')}</th>
                        <th>{t('date')}</th>
                        <th>{t('total')}</th>
                        <th>{t('status')}</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleOrders.map((order) => (
                        <tr key={order.id}>
                          <td>#{order.id}</td>
                          <td>{formatDate(order.date)}</td>
                          <td>₴{formatPrice(getOrderTotal(order))}</td>
                          <td><span className={`badge ${statusBadgeClass(order)}`}>{renderStatus(order)}</span></td>
                          <td className="text-end">
                            <button type="button" className="tp-btn tp-btn-2" onClick={() => setSelectedOrderId(order.id)}>
                              {t('order_details')}
                            </button>
                          </td>
                        </tr>
                      ))}
                      {visibleOrders.length === 0 && (
                        <tr><td colSpan={5} className="text-center text-muted py-4">{t('no_orders_found')}</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Lazy-load */}
                {visibleCount < filteredOrders.length && (
                  <div className="text-center mt-3">
                    <button type="button" className="tp-btn tp-btn-border" onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}>
                      {l.loadMore} ({filteredOrders.length - visibleCount})
                    </button>
                  </div>
                )}
              </>
            )}

            {/* Детали — модалка (адаптив) */}
            {selectedOrderId && (
              <div
                onClick={() => setSelectedOrderId(null)}
                style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1050, overflowY: 'auto', padding: '12px' }}
              >
                <div
                  onClick={(e) => e.stopPropagation()}
                  style={{ background: '#fff', borderRadius: 12, maxWidth: 920, width: '100%', margin: '24px auto', maxHeight: '92vh', overflowY: 'auto' }}
                >
                  <div className="p-3 p-md-4">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <h4 className="mb-0"><i className="fas fa-receipt me-2 text-primary"></i>{t('order_details')} #{selectedOrderId}</h4>
                      <button className="btn btn-outline-secondary btn-sm" aria-label={l.close} onClick={() => setSelectedOrderId(null)}>
                        <i className="fas fa-times"></i>
                      </button>
                    </div>

                    {orderLoading ? (
                      <div className="text-center py-4">
                        <div className="spinner-border spinner-border-sm text-primary" role="status"><span className="visually-hidden">Loading...</span></div>
                        <p className="mt-2 small">{t('loading')}</p>
                      </div>
                    ) : orderToShow ? (
                      <div className="tp-order-details-content">
                        <div className="row mb-4">
                          <div className="col-md-6 mb-3 mb-md-0">
                            <div className="card h-100">
                              <div className="card-header bg-primary text-white">
                                <h6 className="mb-0"><i className="fas fa-user me-2"></i>{t('customer_info')}</h6>
                              </div>
                              <div className="card-body">
                                <div className="mb-2"><strong className="text-muted">{t('name')}:</strong><span className="ms-2">{orderToShow.name} {orderToShow.last_name}</span></div>
                                <div className="mb-2"><strong className="text-muted">{t('phone')}:</strong><span className="ms-2">{orderToShow.phone}</span></div>
                                <div className="mb-2"><strong className="text-muted">{t('address')}:</strong><span className="ms-2">{orderToShow.nova_post_address}</span></div>
                                {orderToShow.description && (
                                  <div><strong className="text-muted">{t('description')}:</strong><span className="ms-2">{orderToShow.description}</span></div>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="card h-100">
                              <div className="card-header bg-info text-white">
                                <h6 className="mb-0"><i className="fas fa-info-circle me-2"></i>{t('order_info')}</h6>
                              </div>
                              <div className="card-body">
                                <div className="mb-2"><strong className="text-muted">{t('date')}:</strong><span className="ms-2">{formatDate(orderToShow.date)}</span></div>
                                <div className="mb-2">
                                  <strong className="text-muted">{t('payment_method')}:</strong>
                                  <span className="ms-2">
                                    {orderToShow.prepayment ? t('pay_now') : orderToShow.bank_transfer ? t('bank_transfer') : orderToShow.nova_post_address ? t('cash_on_delivery') : t('pickup_payment')}
                                  </span>
                                </div>
                                <div className="mb-2">
                                  <strong className="text-muted">{t('payment_status')}:</strong>
                                  <span className={`ms-2 badge ${orderToShow.is_paid ? 'bg-success' : 'bg-warning'}`}>{orderToShow.is_paid ? t('paid') : t('notPaid')}</span>
                                </div>
                                {orderToShow.payment_document && (
                                  <div className="mb-2">
                                    <strong className="text-muted">{t('payment_document', { defaultValue: 'Документ про оплату' })}:</strong>
                                    <a href={orderToShow.payment_document} target="_blank" rel="noopener noreferrer" className="ms-2">{t('view_document', { defaultValue: 'Переглянути' })}</a>
                                  </div>
                                )}
                                {orderToShow.ttn && (
                                  <div className="mb-2"><strong className="text-muted">{t('tracking_number')}:</strong><span className="ms-2 font-monospace">{orderToShow.ttn}</span></div>
                                )}
                                {orderToShow.discount_percent && (
                                  <div><strong className="text-muted">{t('discount')}:</strong><span className="ms-2 text-success fw-bold">{orderToShow.discount_percent}%</span></div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="card">
                          <div className="card-header bg-success text-white">
                            <h6 className="mb-0"><i className="fas fa-shopping-cart me-2"></i>{t('order_items')}</h6>
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
                                      <td className="align-middle"><div className="fw-medium">{item.title}</div></td>
                                      <td className="align-middle text-center"><span className="badge bg-secondary">{item.quantity}</span></td>
                                      <td className="align-middle text-end">₴{formatPrice(item.original_price_minor)}</td>
                                      <td className="align-middle text-end fw-semibold">₴{formatPrice(item.original_price_minor * item.quantity)}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>

                        <div className="row justify-content-end mt-4">
                          <div className="col-md-5">
                            <div className="card">
                              <div className="card-header bg-success text-white">
                                <h6 className="mb-0"><i className="fas fa-calculator me-2"></i>{t('order_summary')}</h6>
                              </div>
                              <div className="card-body">
                                {/* AIRBAG-90: скрываем строку подытога, когда она 0 */}
                                {orderToShow.subtotal_minor > 0 && (
                                  <div className="d-flex justify-content-between mb-2">
                                    <span className="text-muted">{t('subtotal')}:</span>
                                    <span>₴{formatPrice(orderToShow.subtotal_minor)}</span>
                                  </div>
                                )}
                                {orderToShow.discount_total_minor > 0 && (
                                  <div className="d-flex justify-content-between mb-2">
                                    <span className="text-muted">{t('discount')}:</span>
                                    <span className="text-success">-₴{formatPrice(orderToShow.discount_total_minor)}</span>
                                  </div>
                                )}
                                <hr />
                                <div className="d-flex justify-content-between">
                                  <strong className="fs-5">{t('total')}:</strong>
                                  <strong className="fs-5 text-primary">₴{formatPrice(getOrderTotal(orderToShow))}</strong>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderPage;
