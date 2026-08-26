'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { useLocale, useTranslations } from 'next-intl';
// internal
import { CloseEye, OpenEye } from '@/svg';
import ErrorMsg from '../common/error-msg';
import { notifyError, notifySuccess } from '@/utils/toast';
import { useClaimAccountMutation } from '@/redux/features/auth/authApi';

// Форма забора аккаунта из старой системы: почта и пароль ложатся в уже
// существующую запись клиента, вместе с его историей заказов и скидкой.
const ClaimAccountForm = ({ code, onDone }) => {
  const t = useTranslations('Common');
  const locale = useLocale();
  const [showPass, setShowPass] = useState(false);
  const [claimError, setClaimError] = useState('');
  const [claimAccount, { isLoading }] = useClaimAccountMutation();

  const schema = Yup.object().shape({
    email: Yup.string()
      .required(t('emailRequired'))
      .email(t('invalidEmail'))
      .label('Email'),
    password: Yup.string()
      .required(t('passwordRequired'))
      .min(6, t('minCharacters', { count: 6 }))
      .matches(/^(?=.*[a-zA-Z])(?=.*\d)/, t('passwordLettersAndNumbers'))
      .label('Password'),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({ resolver: yupResolver(schema) });

  const onSubmit = async (data) => {
    setClaimError('');
    try {
      await claimAccount({
        code,
        email: data.email,
        password: data.password,
        locale,
      }).unwrap();
      notifySuccess(t('claimSuccessText'));
      onDone();
    } catch (error) {
      // Бэкенд отвечает одним полем message: код недействителен, аккаунт уже
      // активирован или почта занята другим аккаунтом.
      let message = error?.data?.message || t('serverError');
      if (error?.status === 429) {
        message = t('tooManyRequests');
      }
      setClaimError(message);
      notifyError(message);
    } finally {
      reset({ password: '' }, { keepValues: true });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="tp-login-input-wrapper">
        <div className="tp-login-input-box">
          <div className="tp-login-input">
            <input
              {...register('email')}
              id="claim-email"
              name="email"
              type="email"
              placeholder="AirBag@mail.com"
            />
          </div>
          <div className="tp-login-input-title">
            <label htmlFor="claim-email">{t('yourEmail')}</label>
          </div>
          <ErrorMsg msg={errors.email?.message} />
        </div>

        <div className="tp-login-input-box">
          <div className="p-relative">
            <div className="tp-login-input">
              <input
                {...register('password')}
                id="claim-password"
                name="password"
                type={showPass ? 'text' : 'password'}
                placeholder={t('minCharacters', { count: 6 })}
              />
            </div>
            <div className="tp-login-input-eye">
              <span className="open-eye" onClick={() => setShowPass(!showPass)}>
                {showPass ? <CloseEye /> : <OpenEye />}
              </span>
            </div>
            <div className="tp-login-input-title">
              <label htmlFor="claim-password">{t('password')}</label>
            </div>
          </div>
          <ErrorMsg msg={errors.password?.message} />
        </div>
      </div>

      <div className="tp-login-bottom">
        <button type="submit" className="tp-login-btn w-100" disabled={isLoading}>
          {t('claimCreateLogin')}
        </button>
        {claimError && (
          <div className="tp-register-error mt-3">
            <p className="text-danger mb-0">{claimError}</p>
          </div>
        )}
      </div>
    </form>
  );
};

export default ClaimAccountForm;
