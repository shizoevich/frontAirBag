'use client';
import React, { useState, useRef, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useGetBankDetailsQuery } from '@/redux/features/ordersApi';

/**
 * Bank transfer payment block: shows bank details + drag-and-drop / click file
 * upload with preview. Responsive — works on mobile (tap) and desktop (drag or click).
 * The selected file is lifted up via onFileSelect so the parent can upload it
 * after the order is created (order_id is required for the upload endpoint).
 */
const ACCEPTED = 'image/*,application/pdf';
const MAX_MB = 10;

const BankTransferDetails = ({ onFileSelect, selectedFile }) => {
  const t = useTranslations('Checkout');
  const locale = useLocale();
  const orWord = locale === 'ru' ? 'ИЛИ' : locale === 'en' ? 'OR' : 'АБО';
  const { data: bank, isLoading } = useGetBankDetailsQuery();
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState('');
  const inputRef = useRef(null);

  const acceptFile = useCallback((file) => {
    if (!file) return;
    setFileError('');
    const isAllowed = file.type.startsWith('image/') || file.type === 'application/pdf';
    if (!isAllowed) {
      setFileError(t('upload_invalid_type', { defaultValue: 'Дозволені лише зображення або PDF' }));
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      setFileError(t('upload_too_large', { defaultValue: `Файл завеликий (макс ${MAX_MB} МБ)` }));
      return;
    }
    onFileSelect(file);
    setPreviewUrl(file.type.startsWith('image/') ? URL.createObjectURL(file) : null);
  }, [onFileSelect, t]);

  const handleFileChange = (e) => acceptFile(e.target.files?.[0]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    acceptFile(e.dataTransfer.files?.[0]);
  }, [acceptFile]);

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
  const openPicker = () => inputRef.current?.click();
  const onKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openPicker(); }
  };

  const handleRemove = () => {
    onFileSelect(null);
    setPreviewUrl(null);
    setFileError('');
    if (inputRef.current) inputRef.current.value = '';
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
          {/* AIRBAG-84: вариант 1 — оплата на карту */}
          {bank.card_number && (
            <div className="mb-2">
              {detailRow(t('bank_card_number', { defaultValue: 'Номер картки' }), bank.card_number)}
            </div>
          )}

          {/* Разделитель «ИЛИ/АБО» — между картой и реквизитами */}
          {bank.card_number && (bank.full_name || bank.account_number || bank.edrpou) && (
            <div className="d-flex align-items-center my-2" aria-hidden="true">
              <span style={{ flex: 1, height: 1, background: '#d7dde6' }} />
              <span className="px-3 text-muted fw-semibold small">{orWord}</span>
              <span style={{ flex: 1, height: 1, background: '#d7dde6' }} />
            </div>
          )}

          {/* AIRBAG-84: вариант 2 — оплата по банковским реквизитам */}
          {detailRow(t('bank_full_name', { defaultValue: 'Отримувач' }), bank.full_name)}
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

        {/* Hidden native input — opened via click/tap or Enter/Space */}
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED}
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />

        {!selectedFile ? (
          <div
            role="button"
            tabIndex={0}
            onClick={openPicker}
            onKeyDown={onKeyDown}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className="tp-dropzone text-center"
            style={{
              border: `2px dashed ${isDragging ? '#de8043' : '#c5ccd6'}`,
              background: isDragging ? '#fff8f4' : '#fff',
              borderRadius: 10,
              padding: '22px 16px',
              cursor: 'pointer',
              transition: 'border-color .15s ease, background .15s ease',
            }}
          >
            <div style={{ fontSize: 34, lineHeight: 1 }}>⬆️</div>
            <div className="fw-medium mt-2" style={{ fontSize: 14 }}>
              {t('dropzone_title', { defaultValue: 'Натисніть або перетягніть файл' })}
            </div>
            <div className="text-muted" style={{ fontSize: 12, marginTop: 2 }}>
              {t('dropzone_subtitle', { defaultValue: 'JPG, PNG або PDF · до 10 МБ' })}
            </div>
          </div>
        ) : (
          <div className="d-flex align-items-center gap-3 p-2 rounded" style={{ background: '#fff', border: '1px solid #dde1e7' }}>
            {previewUrl ? (
              <img src={previewUrl} alt="preview" style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }} />
            ) : (
              <span style={{ fontSize: 28, flexShrink: 0 }}>📄</span>
            )}
            <div className="flex-grow-1 min-w-0">
              <div className="fw-medium text-break" style={{ fontSize: 13 }}>{selectedFile.name}</div>
              <div className="text-muted" style={{ fontSize: 12 }}>{(selectedFile.size / 1024).toFixed(0)} KB</div>
            </div>
            <button type="button" className="btn btn-sm btn-outline-secondary" onClick={openPicker} title={t('replace_file', { defaultValue: 'Замінити' })}>
              ↻
            </button>
            <button type="button" className="btn btn-sm btn-outline-danger" onClick={handleRemove} title={t('remove_file', { defaultValue: 'Видалити' })}>
              ✕
            </button>
          </div>
        )}

        {fileError && <small className="text-danger d-block mt-1">{fileError}</small>}
        <small className="text-muted d-block mt-1">
          {t('upload_payment_doc_hint', { defaultValue: 'Скриншот або PDF чеку про оплату. Обов\'язково.' })}
        </small>
      </div>
    </div>
  );
};

export default BankTransferDetails;
