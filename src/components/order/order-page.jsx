'use client';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useGetOrdersListQuery, useGetOrderByIdQuery } from '@/redux/features/ordersApi';
import { useSelector } from 'react-redux';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';

const LIMIT = 20;

// AIRBAG-88: подписи фильтров/служебные — инлайн по локали.
const L = {
  uk: {
    dateFrom: 'Дата від', dateTo: 'Дата до', allStatuses: 'Усі статуси', reset: 'Скинути',
    sort: 'Сортування', newest: 'Спочатку нові', oldest: 'Спочатку старі',
    found: 'Знайдено', ordersWord: 'замовлень', sumWord: 'на суму', loadingMore: 'Завантаження…',
    statusPending: 'В обробці', statusPaid: 'Оплачено', statusCompleted: 'Виконано', close: 'Закрити', pickup: 'Самовивіз',
  },
  ru: {
    dateFrom: 'Дата от', dateTo: 'Дата до', allStatuses: 'Все статусы', reset: 'Сбросить',
    sort: 'Сортировка', newest: 'Сначала новые', oldest: 'Сначала старые',
    found: 'Найдено', ordersWord: 'заказов', sumWord: 'на сумму', loadingMore: 'Загрузка…',
    statusPending: 'В обработке', statusPaid: 'Оплачено', statusCompleted: 'Выполнено', close: 'Закрыть', pickup: 'Самовывоз',
  },
};

const OrderPage = () => {
  const t = useTranslations('Orders');
  const locale = useLocale();
  const l = L[locale] || L.uk;
  const { user } = useSelector((state) => state.auth);

  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [status, setStatus] = useState('all');
  const [sortField, setSortField] = useState('date'); // сортировка по колонке
  const [sortDir, setSortDir] = useState('desc'); // по умолчанию новые сверху
  const [offset, setOffset] = useState(0);

  const scrollRef = useRef(null);
  const sentinelRef = useRef(null);

  // Смена фильтра/сортировки → запрос на бэкенд с начала
  const resetTo = (setter) => (val) => { setter(val); setOffset(0); };

  // AIRBAG-88: сортировка по колонкам (дата/сумма/статус) через бэкенд ordering
  const FIELD_ORDERING = { date: 'date', grand_total_minor: 'grand_total_minor', status: 'is_completed,is_paid' };
  const ordering = sortDir === 'desc'
    ? FIELD_ORDERING[sortField].split(',').map((f) => `-${f}`).join(',')
    : FIELD_ORDERING[sortField];
  const toggleSort = (field) => {
    if (sortField === field) setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'));
    else { setSortField(field); setSortDir('desc'); }
    setOffset(0);
  };
  const sortIcon = (field) => (sortField !== field ? 'fa-sort text-muted' : sortDir === 'desc' ? 'fa-sort-down' : 'fa-sort-up');

  const { data, isLoading, isFetching, error } = useGetOrdersListQuery({
    client: user?.id, ordering, dateFrom, dateTo, status, limit: LIMIT, offset,
  });

  const displayOrders = useMemo(() => {
    const results = data?.results || data?.data || data || [];
    return Array.isArray(results) ? results : [];
  }, [data]);

  const totalCount = data?.count ?? displayOrders.length;
  const totalAmountMinor = data?.total_amount_minor ?? 0;
  const hasMore = displayOrders.length < totalCount;

  const { data: selectedOrder, isLoading: orderLoading } = useGetOrderByIdQuery(selectedOrderId, { skip: !selectedOrderId });

  const formatPrice = (priceMinor) => (Number(priceMinor || 0) / 100).toFixed(2);
  const getOrderTotal = (order) => {
    if (order?.grand_total_minor > 0) return order.grand_total_minor;
    if (order?.items?.length > 0) return order.items.reduce((s, it) => s + (it.original_price_minor || 0) * (it.quantity || 1), 0);
    return 0;
  };
  const formatDate = (d) => (d ? new Date(d).toLocaleDateString('uk-UA') : '');
  const statusOf = (o) => (o?.is_completed ? 'completed' : o?.is_paid ? 'paid' : 'pending');
  const renderStatus = (o) => { const s = statusOf(o); return s === 'completed' ? l.statusCompleted : s === 'paid' ? l.statusPaid : l.statusPending; };
  const statusBadgeClass = (o) => { const s = statusOf(o); return s === 'completed' ? 'bg-success' : s === 'paid' ? 'bg-info' : 'bg-secondary'; };

  // Бесконечный скролл: подгружаем следующую страницу при достижении низа списка
  useEffect(() => {
    const sentinel = sentinelRef.current;
    const root = scrollRef.current;
    if (!sentinel || !root) return;
    const io = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !isFetching) {
        setOffset((o) => o + LIMIT);
      }
    }, { root, rootMargin: '120px' });
    io.observe(sentinel);
    return () => io.disconnect();
  }, [hasMore, isFetching, displayOrders.length]);

  const resetFilters = () => { setDateFrom(''); setDateTo(''); setStatus('all'); setSortField('date'); setSortDir('desc'); setOffset(0); };

  const orderToShow = selectedOrder || displayOrders.find((o) => o.id === selectedOrderId);

  return (
    <div className="tp-order-area pt-80 pb-80">
      <div className="container">
        <div className="row">
          <div className="col-12">
            <h3 className="mb-4">{t('my_orders')}</h3>

            {/* Фильтры */}
            <div className="card mb-3">
              <div className="card-body">
                <div className="row g-2 align-items-end">
                  <div className="col-6 col-md-3">
                    <label className="form-label small text-muted mb-1">{l.dateFrom}</label>
                    <input type="date" className="form-control form-control-sm" value={dateFrom} onChange={(e) => resetTo(setDateFrom)(e.target.value)} />
                  </div>
                  <div className="col-6 col-md-3">
                    <label className="form-label small text-muted mb-1">{l.dateTo}</label>
                    <input type="date" className="form-control form-control-sm" value={dateTo} onChange={(e) => resetTo(setDateTo)(e.target.value)} />
                  </div>
                  <div className="col-6 col-md-2">
                    <label className="form-label small text-muted mb-1">{t('status')}</label>
                    <select className="form-select form-select-sm" value={status} onChange={(e) => resetTo(setStatus)(e.target.value)}>
                      <option value="all">{l.allStatuses}</option>
                      <option value="pending">{l.statusPending}</option>
                      <option value="paid">{l.statusPaid}</option>
                      <option value="completed">{l.statusCompleted}</option>
                    </select>
                  </div>
                  <div className="col-12 col-md-4">
                    <button type="button" className="btn btn-outline-secondary btn-sm w-100" onClick={resetFilters}>{l.reset}</button>
                  </div>
                </div>
                {/* Подытог текущего запроса (с бэкенда, по всем отфильтрованным) */}
                <div className="mt-3 small">
                  <span className="text-muted">{l.found}:</span>{' '}
                  <strong>{totalCount}</strong> {l.ordersWord}{' '}
                  <span className="text-muted">{l.sumWord}</span>{' '}
                  <strong className="text-primary">₴{formatPrice(totalAmountMinor)}</strong>
                </div>
              </div>
            </div>

            {isLoading && (
              <div className="text-center py-5">
                <div className="spinner-border" role="status"><span className="visually-hidden">Loading...</span></div>
                <p className="mt-3">{t('loading')}</p>
              </div>
            )}

            {!isLoading && error && <div className="alert alert-danger">{t('error_loading_orders')}</div>}

            {!isLoading && !error && totalCount === 0 && (
              <div className="text-center py-5">
                <h4>{t('no_orders_found')}</h4>
                <p className="mb-4">{t('no_orders_description')}</p>
                <Link href={`/${locale}`} className="tp-btn">{t('start_shopping')}</Link>
              </div>
            )}

            {!isLoading && !error && totalCount > 0 && (
              <div ref={scrollRef} style={{ maxHeight: '60vh', overflowY: 'auto', border: '1px solid #e6eaf0', borderRadius: 8 }}>
                <table className="table table-striped mb-0">
                  <thead className="table-light" style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                    <tr>
                      <th>{t('orderNumber')}</th>
                      <th role="button" style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => toggleSort('date')}>
                        {t('date')} <i className={`fas ${sortIcon('date')} ms-1`} />
                      </th>
                      <th role="button" style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => toggleSort('grand_total_minor')}>
                        {t('total')} <i className={`fas ${sortIcon('grand_total_minor')} ms-1`} />
                      </th>
                      <th role="button" style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => toggleSort('status')}>
                        {t('status')} <i className={`fas ${sortIcon('status')} ms-1`} />
                      </th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayOrders.map((order) => (
                      <tr key={order.id}>
                        <td>#{order.id}</td>
                        <td>{formatDate(order.date)}</td>
                        <td>₴{formatPrice(getOrderTotal(order))}</td>
                        <td><span className={`badge ${statusBadgeClass(order)}`}>{renderStatus(order)}</span></td>
                        <td className="text-end">
                          <button type="button" className="tp-btn tp-btn-2" onClick={() => setSelectedOrderId(order.id)}>{t('order_details')}</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {/* Sentinel для бесконечной подгрузки */}
                <div ref={sentinelRef} style={{ height: 1 }} />
                {isFetching && (
                  <div className="text-center py-3 small text-muted">{l.loadingMore}</div>
                )}
              </div>
            )}

            {/* Детали — модалка (адаптив) */}
            {selectedOrderId && (
              <div onClick={() => setSelectedOrderId(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1050, overflowY: 'auto', padding: '12px' }}>
                <div onClick={(e) => e.stopPropagation()} style={{ background: '#fff', borderRadius: 12, maxWidth: 920, width: '100%', margin: '24px auto', maxHeight: '92vh', overflowY: 'auto' }}>
                  <div className="p-3 p-md-4">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <h4 className="mb-0"><i className="fas fa-receipt me-2 text-primary"></i>{t('order_details')} #{selectedOrderId}</h4>
                      <button className="btn btn-outline-secondary btn-sm" aria-label={l.close} onClick={() => setSelectedOrderId(null)}><i className="fas fa-times"></i></button>
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
                              <div className="card-header bg-primary text-white"><h6 className="mb-0"><i className="fas fa-user me-2"></i>{t('customer_info')}</h6></div>
                              <div className="card-body">
                                <div className="mb-2"><strong className="text-muted">{t('name')}:</strong><span className="ms-2">{orderToShow.name} {orderToShow.last_name}</span></div>
                                <div className="mb-2"><strong className="text-muted">{t('phone')}:</strong><span className="ms-2">{orderToShow.phone}</span></div>
                                <div className="mb-2"><strong className="text-muted">{t('address')}:</strong><span className="ms-2">{(orderToShow.nova_post_address || '').replace(/[\s,]+/g, '') ? orderToShow.nova_post_address : l.pickup}</span></div>
                                {orderToShow.description && (<div><strong className="text-muted">{t('description')}:</strong><span className="ms-2">{orderToShow.description}</span></div>)}
                              </div>
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="card h-100">
                              <div className="card-header bg-info text-white"><h6 className="mb-0"><i className="fas fa-info-circle me-2"></i>{t('order_info')}</h6></div>
                              <div className="card-body">
                                <div className="mb-2"><strong className="text-muted">{t('date')}:</strong><span className="ms-2">{formatDate(orderToShow.date)}</span></div>
                                <div className="mb-2">
                                  <strong className="text-muted">{t('payment_method')}:</strong>
                                  <span className="ms-2">{orderToShow.prepayment ? t('pay_now') : orderToShow.bank_transfer ? t('bank_transfer') : orderToShow.nova_post_address ? t('cash_on_delivery') : t('pickup_payment')}</span>
                                </div>
                                <div className="mb-2">
                                  <strong className="text-muted">{t('payment_status')}:</strong>
                                  <span className={`ms-2 badge ${orderToShow.is_paid ? 'bg-success' : 'bg-warning'}`}>{orderToShow.is_paid ? t('paid') : t('notPaid')}</span>
                                </div>
                                {orderToShow.payment_document && (
                                  <div className="mb-2"><strong className="text-muted">{t('payment_document', { defaultValue: 'Документ про оплату' })}:</strong>
                                    <a href={orderToShow.payment_document} target="_blank" rel="noopener noreferrer" className="ms-2">{t('view_document', { defaultValue: 'Переглянути' })}</a></div>
                                )}
                                {orderToShow.ttn && (<div className="mb-2"><strong className="text-muted">{t('tracking_number')}:</strong><span className="ms-2 font-monospace">{orderToShow.ttn}</span></div>)}
                                {orderToShow.discount_percent && (<div><strong className="text-muted">{t('discount')}:</strong><span className="ms-2 text-success fw-bold">{orderToShow.discount_percent}%</span></div>)}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="card">
                          <div className="card-header bg-success text-white"><h6 className="mb-0"><i className="fas fa-shopping-cart me-2"></i>{t('order_items')}</h6></div>
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
                              <div className="card-header bg-success text-white"><h6 className="mb-0"><i className="fas fa-calculator me-2"></i>{t('order_summary')}</h6></div>
                              <div className="card-body">
                                {(() => {
                                  // AIRBAG-90/доработка: показываем и сумму без скидки, и со скидкой
                                  const totalMinor = getOrderTotal(orderToShow);
                                  const itemsSum = orderToShow.items?.reduce((s, it) => s + (it.original_price_minor || 0) * (it.quantity || 1), 0) || 0;
                                  const subtotalMinor = orderToShow.subtotal_minor > 0 ? orderToShow.subtotal_minor : (itemsSum || totalMinor);
                                  const discountMinor = orderToShow.discount_total_minor > 0 ? orderToShow.discount_total_minor : Math.max(0, subtotalMinor - totalMinor);
                                  return (
                                    <>
                                      {/* Строки "без скидки" и "скидка" — только если реальная скидка > 0 */}
                                      {discountMinor > 0 && (
                                        <>
                                          <div className="d-flex justify-content-between mb-2">
                                            <span className="text-muted">{t('amount_no_discount')}:</span>
                                            <span>₴{formatPrice(subtotalMinor)}</span>
                                          </div>
                                          <div className="d-flex justify-content-between mb-2">
                                            <span className="text-muted">{t('discount')}:</span>
                                            <span className="text-success">-₴{formatPrice(discountMinor)}</span>
                                          </div>
                                          <hr />
                                        </>
                                      )}
                                      <div className="d-flex justify-content-between">
                                        <strong className="fs-5">{t('grand_total_label')}:</strong>
                                        <strong className="fs-5 text-primary">₴{formatPrice(totalMinor)}</strong>
                                      </div>
                                    </>
                                  );
                                })()}
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
