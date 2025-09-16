'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslations } from 'next-intl';

const UserInfoModal = ({ isOpen, onClose, onSubmit, user }) => {
  const t = useTranslations('Checkout');
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      firstName: user?.name || '',
      lastName: user?.last_name || '',
      phone: user?.phone || '',
      address: user?.nova_post_address || ''
    }
  });

  if (!isOpen) return null;

  const submitHandler = (data) => {
    onSubmit(data);
  };

  return (
    <div className="tp-modal-overlay">
      <div className="tp-modal-content">
        <div className="tp-modal-header">
          <h4 className="tp-modal-title">{t('user_info_required')}</h4>
          <button 
            type="button" 
            className="tp-modal-close"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit(submitHandler)}>
          <div className="tp-modal-body">
            <p className="tp-modal-description">
              {t('user_info_description')}
            </p>
            
            <div className="row">
              <div className="col-md-6">
                <div className="tp-checkout-input">
                  <label>{t('first_name')} *</label>
                  <input
                    {...register("firstName", { 
                      required: t('first_name_required') 
                    })}
                    type="text"
                    placeholder={t('enter_first_name')}
                  />
                  {errors.firstName && (
                    <span className="error-message">{errors.firstName.message}</span>
                  )}
                </div>
              </div>
              
              <div className="col-md-6">
                <div className="tp-checkout-input">
                  <label>{t('last_name')} *</label>
                  <input
                    {...register("lastName", { 
                      required: t('last_name_required') 
                    })}
                    type="text"
                    placeholder={t('enter_last_name')}
                  />
                  {errors.lastName && (
                    <span className="error-message">{errors.lastName.message}</span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="tp-checkout-input">
              <label>{t('phone')} *</label>
              <input
                {...register("phone", { 
                  required: t('phone_required'),
                  pattern: {
                    value: /^(\+380|380|0)[0-9]{9}$/,
                    message: t('phone_invalid')
                  }
                })}
                type="tel"
                placeholder="+380501234567"
              />
              {errors.phone && (
                <span className="error-message">{errors.phone.message}</span>
              )}
            </div>
            
            <div className="tp-checkout-input">
              <label>{t('nova_post_address')} *</label>
              <textarea
                {...register("address", { 
                  required: t('address_required') 
                })}
                placeholder={t('nova_post_placeholder')}
                rows="3"
              />
              {errors.address && (
                <span className="error-message">{errors.address.message}</span>
              )}
            </div>
          </div>
          
          <div className="tp-modal-footer">
            <button 
              type="button" 
              className="tp-btn tp-btn-border"
              onClick={onClose}
            >
              {t('cancel')}
            </button>
            <button 
              type="submit" 
              className="tp-btn"
            >
              {t('save_and_continue')}
            </button>
          </div>
        </form>
      </div>
      
      <style jsx>{`
        .tp-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
        }
        
        .tp-modal-content {
          background: white;
          border-radius: 8px;
          max-width: 600px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
        }
        
        .tp-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid #eee;
        }
        
        .tp-modal-title {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 600;
        }
        
        .tp-modal-close {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          padding: 0;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .tp-modal-body {
          padding: 20px;
        }
        
        .tp-modal-description {
          margin-bottom: 20px;
          color: #666;
        }
        
        .tp-modal-footer {
          padding: 20px;
          border-top: 1px solid #eee;
          display: flex;
          gap: 10px;
          justify-content: flex-end;
        }
        
        .tp-checkout-input {
          margin-bottom: 20px;
        }
        
        .tp-checkout-input label {
          display: block;
          margin-bottom: 5px;
          font-weight: 500;
        }
        
        .tp-checkout-input input,
        .tp-checkout-input textarea {
          width: 100%;
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }
        
        .tp-checkout-input input:focus,
        .tp-checkout-input textarea:focus {
          outline: none;
          border-color: #de8043;
        }
        
        .error-message {
          color: #dc3545;
          font-size: 12px;
          margin-top: 5px;
          display: block;
        }
      `}</style>
    </div>
  );
};

export default UserInfoModal;
