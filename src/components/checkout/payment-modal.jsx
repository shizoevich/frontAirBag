'use client';
import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { notifyError, notifyInfo, notifySuccess } from '@/utils/toast';
import { useDispatch } from 'react-redux';
import { clearCart } from '@/redux/features/cartSlice';
import { useGetOrderByIdQuery, useUpdateOrderMutation } from '@/redux/features/ordersApi';

const PaymentModal = ({
  isOpen,
  onClose,
  iframeUrl,
  orderId: orderIdProp,
  title = 'Payment',
  onPaymentResult,
}) => {
  const router = useRouter();
  const { locale } = useParams();
  const t = useTranslations('Payments');
  const dispatch = useDispatch();
  const [updateOrder] = useUpdateOrderMutation();
  const handledSuccessRef = React.useRef(false);
  const { data: orderData } = useGetOrderByIdQuery(orderIdProp, {
    skip: !isOpen || !orderIdProp,
    pollingInterval: isOpen && orderIdProp ? 5000 : 0,
    refetchOnFocus: true,
  });

  const handlePaymentSuccess = React.useCallback(
    (orderId) => {
      if (handledSuccessRef.current) return;
      handledSuccessRef.current = true;
      notifySuccess(t('payment_success'));
      if (orderId) {
        updateOrder({ id: orderId, is_paid: true, is_completed: true }).catch(() => null);
      }
      dispatch(clearCart());
      onClose?.();
      router.push(`/${locale}/orders`);
    },
    [dispatch, locale, onClose, router, t, updateOrder]
  );

  const resolveFailureMessage = React.useCallback(
    ({ errCode, reason }) => {
      const code = errCode ? String(errCode) : null;
      if (code) {
        // Known provider error codes (monobank)
        const key = `err_${code}`;
        // next-intl exposes `t.has()` in this project, but it may not exist everywhere.
        const hasKey = typeof t?.has === 'function' ? t.has(key) : false;
        if (hasKey) return t(key);
      }

      if (reason) return t('payment_failed_with_reason', { reason: String(reason) });
      return t('payment_failed');
    },
    [t]
  );

  // Handle provider redirects inside the iframe by listening for postMessage from
  // [`PaymentRedirectPage()`](src/app/[locale]/payment-redirect/page.jsx:1).
  React.useEffect(() => {
    if (!isOpen) return;
    if (typeof window === 'undefined') return;

    const onMessage = (event) => {
      // Only accept same-origin messages
      if (event.origin !== window.location.origin) return;
      const data = event.data;
      if (!data || data.type !== 'monobank-payment-result') return;

      const result = String(data.result || 'unknown').toLowerCase();
      const reason = data.reason ? String(data.reason) : null;
      const errCode = data.errCode ? String(data.errCode) : null;
      const orderId = data.orderId ? String(data.orderId) : (orderIdProp ? String(orderIdProp) : null);

      onPaymentResult?.({ result, reason, errCode, orderId });

      if (result === 'success') {
        handlePaymentSuccess(orderId);
        return;
      }

      if (result === 'failed') {
        notifyError(resolveFailureMessage({ errCode, reason }));
        // Stay on checkout page, just close modal
        onClose?.();
        return;
      }

      notifyInfo(t('payment_status_unknown'));
      onClose?.();
    };

    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [dispatch, isOpen, locale, onClose, onPaymentResult, resolveFailureMessage, router, t, updateOrder]);

  React.useEffect(() => {
    if (!isOpen) return;
    if (!orderData?.is_paid) return;
    handlePaymentSuccess(orderIdProp ? String(orderIdProp) : null);
  }, [handlePaymentSuccess, isOpen, orderData?.is_paid, orderIdProp]);

  // Prevent background scroll when modal is open.
  React.useEffect(() => {
    if (!isOpen) return;
    if (typeof document === 'undefined') return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen]);

  // Allow closing modal with Escape.
  React.useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onMouseDown={(e) => {
        // Click outside closes modal
        if (e.target === e.currentTarget) onClose?.();
      }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(0,0,0,0.35)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
    >
      <div
        onMouseDown={(e) => e.stopPropagation()}
        style={{
          width: 'min(980px, calc(100vw - 32px))',
          maxHeight: 'calc(100vh - 32px)',
          background: '#fff',
          borderRadius: 12,
          overflow: 'hidden',
          boxShadow: '0 24px 60px rgba(0,0,0,0.35)',
          display: 'grid',
          gridTemplateRows: 'auto 1fr auto',
        }}
      >
        <div
          style={{
            padding: '12px 16px',
            borderBottom: '1px solid rgba(0,0,0,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <div style={{ fontWeight: 600 }}>{title}</div>
          <button
            type="button"
            className="tp-btn tp-btn-border"
            onClick={onClose}
            aria-label="Close"
            style={{ padding: '6px 10px' }}
          >
            ✕
          </button>
        </div>

        <div style={{ background: '#fff' }}>
          {iframeUrl ? (
            <iframe
              title="payment"
              src={iframeUrl}
              allow="payment *"
              style={{
                border: 'none',
                width: '100%',
                height: 'min(78vh, 720px)',
                display: 'block',
              }}
            />
          ) : (
            <div style={{ padding: 24 }}>Loading payment...</div>
          )}
        </div>

        <div
          style={{
            padding: '12px 16px',
            borderTop: '1px solid rgba(0,0,0,0.08)',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 10,
            flexWrap: 'wrap',
          }}
        >
          {iframeUrl && (
            <a className="tp-btn tp-btn-2" href={iframeUrl} target="_blank" rel="noreferrer">
              Open in new tab
            </a>
          )}
          <button type="button" className="tp-btn tp-btn-border" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
