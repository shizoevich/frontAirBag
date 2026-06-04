'use client';
import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useGetBankDetailsQuery } from '@/redux/features/ordersApi';

/**
 * Bank transfer payment block: shows bank details + file upload with preview.
 * The selected file is lifted up via onFileSelect so the parent can upload it
 * after the order is created (order_id is required for the upload endpoint).
 */
const BankTransferDetails = ({ onFileSelect, selectedFile }) => {
  const t = useTranslations('Checkout');
  const { data: bank, isLoading } = useGetBankDetailsQuery();
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onFileSelect(file);
    if (file.type.startsWith('image/')) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
  };

  const handleRemove = () => {
    onFileSelect(null);
    setPreviewUrl(null);
  };

  const detailRow = (label, value) =>
    value ? (
      <div className="d-flex justify-content-between py-1 border-bottom">
        <span className="text-muted">{label}</span>
        <span className="fw-semibold text-break ms-2">{value}</span>
      </div>
    ) : null;

  return (
    <div className="tp-bank-transfer mt-3 p-3 rounded" style={{ background: '#f7f9fc', border: '1px solid #e6eaf0' }}>
      <h6 className="mb-3 fw-bold">{t('bank_details_title', { defaultValue: 'Реквізити для оплати' })}</h6>

      {isLoading ? (
        <p className="text-muted mb-0">{t('loading', { defaultValue: 'Завантаження...' })}</p>
      ) : bank ? (
        <div className="mb-3">
          {detailRow(t('bank_full_name', { defaultValue: 'Отримувач' }), bank.full_name)}
          {detailRow(t('bank_card_number', { defaultValue: 'Номер картки' }), bank.card_number)}
          {detailRow(t('bank_account_number', { defaultValue: 'Рахунок' }), bank.account_number)}
          {detailRow(t('bank_edrpou', { defaultValue: 'ЄДРПОУ' }), bank.edrpou)}
          {detailRow(t('bank_payment_purpose', { defaultValue: 'Призначення платежу' }), bank.payment_purpose)}
        </div>
      ) : (
        <p className="text-danger mb-3">{t('bank_details_unavailable', { defaultValue: 'Реквізити тимчасово недоступні' })}</p>
      )}

      <div className="tp-bank-upload">
        <label className="form-label fw-medium mb-2">
          {t('upload_payment_doc', { defaultValue: 'Прикріпіть документ про оплату' })}
          <span className="text-danger"> *</span>
        </label>

        {!selectedFile ? (
          <input
            type="file"
            className="form-control"
            accept="image/*,application/pdf"
            onChange={handleFileChange}
          />
        ) : (
          <div className="d-flex align-items-center gap-3 p-2 rounded" style={{ background: '#fff', border: '1px solid #dde1e7' }}>
            {previewUrl ? (
              <img src={previewUrl} alt="preview" style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 6 }} />
            ) : (
              <span style={{ fontSize: 28 }}>📄</span>
            )}
            <div className="flex-grow-1">
              <div className="fw-medium text-break" style={{ fontSize: 13 }}>{selectedFile.name}</div>
              <div className="text-muted" style={{ fontSize: 12 }}>{(selectedFile.size / 1024).toFixed(0)} KB</div>
            </div>
            <button type="button" className="btn btn-sm btn-outline-danger" onClick={handleRemove}>
              ✕
            </button>
          </div>
        )}
        <small className="text-muted d-block mt-1">
          {t('upload_payment_doc_hint', { defaultValue: 'Скриншот або PDF чеку про оплату. Обов\'язково.' })}
        </small>
      </div>
    </div>
  );
};

export default BankTransferDetails;
