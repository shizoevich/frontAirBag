'use client';
import React from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

const GuestRegistrationModal = ({ isOpen, onClose, onRegister }) => {
  const t = useTranslations('Checkout');

  if (!isOpen) return null;

  return (
    <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{t('guest_checkout_success')}</h5>
            <button 
              type="button" 
              className="btn-close" 
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>
          
          <div className="modal-body">
            <div className="text-center mb-4">
              <div className="tp-checkout-success-icon mb-3">
                <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" fill="#28a745"/>
                  <path d="m9 12 2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <p className="mb-3">{t('register_suggestion')}</p>
            </div>

            <div className="tp-registration-benefits">
              <h6 className="mb-3">{t('register_benefits')}</h6>
              <ul className="list-unstyled">
                <li className="mb-2">
                  <i className="fa-solid fa-check text-success me-2"></i>
                  {t('benefit_track_orders')}
                </li>
                <li className="mb-2">
                  <i className="fa-solid fa-check text-success me-2"></i>
                  {t('benefit_order_history')}
                </li>
                <li className="mb-2">
                  <i className="fa-solid fa-check text-success me-2"></i>
                  {t('benefit_discounts')}
                </li>
                <li className="mb-2">
                  <i className="fa-solid fa-check text-success me-2"></i>
                  {t('benefit_faster_checkout')}
                </li>
              </ul>
            </div>
          </div>
          
          <div className="modal-footer">
            <div className="d-flex gap-2 w-100">
              <Link 
                href="/register" 
                className="tp-btn tp-btn-2 flex-fill"
                onClick={onRegister}
              >
                {t('register_now')}
              </Link>
              <button 
                type="button" 
                className="tp-btn tp-btn-border flex-fill"
                onClick={onClose}
              >
                {t('maybe_later')}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show"></div>
    </div>
  );
};

export default GuestRegistrationModal;
