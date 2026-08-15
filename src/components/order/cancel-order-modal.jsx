'use client';
import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useCancelOrderMutation, useRequestCancelOrderMutation } from '@/redux/features/ordersApi';

// Коды причин должны совпадать с core.models.CancelReason на бэкенде.
const REASONS = [
  'changed_mind',
  'found_cheaper',
  'wrong_items',
  'delivery_too_long',
  'duplicate',
  'other',
];

/**
 * Подтверждение отмены заказа.
 *
 * mode='cancel'  — неоплаченный заказ, отменяется сразу.
 * mode='request' — оплаченный заказ, уходит запрос на подтверждение админом.
 */
const CancelOrderModal = ({ order, mode = 'cancel', onClose, onDone }) => {
  const t = useTranslations('Orders');
  const [reason, setReason] = useState(REASONS[0]);
  const [comment, setComment] = useState('');
  const [errorText, setErrorText] = useState('');

  const [cancelOrder, { isLoading: isCanceling }] = useCancelOrderMutation();
  const [requestCancelOrder, { isLoading: isRequesting }] = useRequestCancelOrderMutation();
  const isSubmitting = isCanceling || isRequesting;

  const isRequestMode = mode === 'request';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorText('');
    const mutate = isRequestMode ? requestCancelOrder : cancelOrder;
    try {
      await mutate({ id: order.id, reason, comment }).unwrap();
      onDone?.();
      onClose?.();
    } catch (err) {
      setErrorText(err?.data?.detail || t('cancel_failed'));
    }
  };

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1060, overflowY: 'auto', padding: '12px' }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: '#fff', borderRadius: 12, maxWidth: 520, width: '100%', margin: '48px auto' }}
      >
        <form className="p-3 p-md-4" onSubmit={handleSubmit}>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0">
              <i className="fas fa-triangle-exclamation me-2 text-danger" />
              {t('cancel_order_title')} #{order.id}
            </h5>
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={onClose} aria-label={t('cancel_keep_order')}>
              <i className="fas fa-times" />
            </button>
          </div>

          <p className="text-muted small">
            {isRequestMode ? t('request_cancel_text') : t('cancel_confirm_text')}
          </p>

          <div className="mb-3">
            <label className="form-label small text-muted mb-1" htmlFor="cancel-reason">
              {t('cancel_reason_label')}
            </label>
            <select
              id="cancel-reason"
              className="form-select form-select-sm"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            >
              {REASONS.map((code) => (
                <option key={code} value={code}>{t(`cancel_reason_${code}`)}</option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label small text-muted mb-1" htmlFor="cancel-comment">
              {t('cancel_comment_label')}
            </label>
            <textarea
              id="cancel-comment"
              className="form-control form-control-sm"
              rows="3"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={t('cancel_comment_placeholder')}
            />
          </div>

          {errorText && <div className="alert alert-danger py-2 small">{errorText}</div>}

          <div className="d-flex flex-column flex-sm-row gap-2 justify-content-end">
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={onClose} disabled={isSubmitting}>
              {t('cancel_keep_order')}
            </button>
            <button type="submit" className="btn btn-danger btn-sm" disabled={isSubmitting}>
              {isSubmitting
                ? t('processing')
                : isRequestMode ? t('cancel_submit_request') : t('cancel_submit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CancelOrderModal;
