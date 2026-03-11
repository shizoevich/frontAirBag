'use client';
import React from 'react';
import { useGetOrderByIdQuery } from '@/redux/features/ordersApi';
import { useCreatePaymentMutation } from '@/redux/features/paymentsApi';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { notifyError, notifyInfo } from '@/utils/toast';

const OrderConfirmation = ({ orderId }) => {
  const t = useTranslations('Orders');
  const { locale } = useParams();
  const { data: order, isLoading, error } = useGetOrderByIdQuery(orderId);
  const [createPayment] = useCreatePaymentMutation();

  const [monoPageUrl, setMonoPageUrl] = React.useState(null);
  const [isCreatingPayment, setIsCreatingPayment] = React.useState(false);
  const [paymentError, setPaymentError] = React.useState(null);

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

  const onCreateMonobankPayment = async () => {
    try {
      setPaymentError(null);
      setIsCreatingPayment(true);

      // New swagger contract: order_id + redirect_url are required
      const redirect_url = `${window.location.origin}/api/monobank/redirect?locale=${encodeURIComponent(
        locale
      )}&order_id=${encodeURIComponent(displayOrder.id)}`;
      const data = await createPayment({ order_id: displayOrder.id, redirect_url }).unwrap();

      const pageUrl =
        data?.page_url ||
        data?.pageUrl ||
        data?.mono_url ||
        data?.monoUrl ||
        data?.redirect_url ||
        data?.redirectUrl ||
        data?.invoice_url ||
        data?.invoiceUrl ||
        data?.url ||
        data?.data?.page_url ||
        data?.data?.pageUrl ||
        data?.data?.mono_url ||
        data?.data?.monoUrl ||
        data?.data?.redirect_url ||
        data?.data?.redirectUrl ||
        data?.data?.invoice_url ||
        data?.data?.invoiceUrl ||
        data?.data?.url;

      if (!pageUrl) throw new Error('Payment URL is missing');
      setMonoPageUrl(pageUrl);
      notifyInfo(t('monobank_payment_opened'));
    } catch (e) {
      console.error('Create Monobank payment error:', e);
      setPaymentError(e?.data?.detail || e?.message || String(e));
      notifyError(t('monobank_payment_create_failed'));
    } finally {
      setIsCreatingPayment(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container">
        <div className="row">
          <div className="col-12">
            <div className="text-center py-5">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3">{t('loading')}</p>
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

                  {/* Payment (Monobank iframe) for prepayment orders */}
                  {displayOrder?.prepayment && (
                    <div className="mt-4">
                      <div className="d-flex flex-wrap gap-2 align-items-center justify-content-between">
                        <h4 className="mb-0">{t('monobank_payment_title')}</h4>
                        <button
                          type="button"
                          className="tp-btn tp-btn-2"
                          onClick={onCreateMonobankPayment}
                          disabled={isCreatingPayment}
                        >
                          {isCreatingPayment ? t('processing') : t('pay_with_monobank')}
                        </button>
                      </div>

                      {paymentError && (
                        <p className="mt-2" style={{ color: '#b00020' }}>
                          {paymentError}
                        </p>
                      )}

                      {monoPageUrl && (
                        <div className="mt-3">
                          <iframe
                            id="payFrame"
                            title={t('monobank_payment_iframe_title')}
                            width="100%"
                            height="600"
                            src={monoPageUrl}
                            allow="payment *"
                            style={{ borderRadius: 24, border: '1px solid rgba(0,0,0,0.08)' }}
                          />
                        </div>
                      )}
                    </div>
                  )}
                
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
                    <Link href={`/${locale}/orders`} className="tp-btn tp-btn-2 me-3">
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
