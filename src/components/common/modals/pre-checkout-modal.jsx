'use client';
import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { useCreateGuestMutation, useRegisterUserMutation } from '@/redux/features/auth/authApi';
import { toast } from 'react-toastify';

const PreCheckoutModal = ({ isOpen, onClose, onProceedAsGuest, checkoutData }) => {
  const t = useTranslations('PreCheckout');
  const router = useRouter();
  const dispatch = useDispatch();
  const [createGuest, { isLoading: isCreatingGuest }] = useCreateGuestMutation();
  const [registerUser, { isLoading: isRegistering }] = useRegisterUserMutation();
  
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirm_password: '',
    name: 'Test',
    last_name: 'User',
    phone: '',
    nova_post_address: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirm_password) {
      toast.error(t('passwordMismatch'));
      return;
    }

    try {
      await registerUser(formData).unwrap();
      toast.success(t('registrationSuccess'));
      onClose();
      // Перенаправляем на страницу оформления заказа
      router.push('/checkout');
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(t('registrationError'));
    }
  };

  const handleProceedAsGuest = async () => {
    try {
      // Создаем гостевой аккаунт с данными из формы оформления
      await createGuest(checkoutData).unwrap();
      onProceedAsGuest();
      onClose();
    } catch (error) {
      console.error('Guest creation error:', error);
      // Если создание гостя не удалось, всё равно продолжаем как гость
      onProceedAsGuest();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{t('title')}</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body">
            {!showRegistrationForm ? (
              <div className="text-center">
                <h6 className="mb-3">{t('chooseOption')}</h6>
                <p className="text-muted mb-4">{t('registrationBenefits')}</p>
                
                <div className="d-grid gap-3">
                  <button
                    className="btn btn-primary btn-lg"
                    onClick={() => setShowRegistrationForm(true)}
                  >
                    {t('register')}
                  </button>
                  
                  <button
                    className="btn btn-outline-secondary"
                    onClick={handleProceedAsGuest}
                    disabled={isCreatingGuest}
                  >
                    {isCreatingGuest ? t('processing') : t('continueAsGuest')}
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleRegister}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">{t('name')}</label>
                    <input
                      type="text"
                      className="form-control"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">{t('lastName')}</label>
                    <input
                      type="text"
                      className="form-control"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                <div className="mb-3">
                  <label className="form-label">{t('email')} *</label>
                  <input
                    type="email"
                    className="form-control"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="mb-3">
                  <label className="form-label">{t('phone')}</label>
                  <input
                    type="tel"
                    className="form-control"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">{t('password')} *</label>
                    <input
                      type="password"
                      className="form-control"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">{t('confirmPassword')} *</label>
                    <input
                      type="password"
                      className="form-control"
                      name="confirm_password"
                      value={formData.confirm_password}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="d-grid gap-2">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isRegistering}
                  >
                    {isRegistering ? t('registering') : t('registerAndContinue')}
                  </button>
                  
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowRegistrationForm(false)}
                  >
                    {t('back')}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreCheckoutModal;
