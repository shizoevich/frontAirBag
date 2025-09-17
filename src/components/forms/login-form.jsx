'use client';
import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
// internal
import { CloseEye, OpenEye } from '@/svg';
import ErrorMsg from '../common/error-msg';
import { useLoginMutation } from '@/redux/features/auth/authApi';
import { notifyError, notifySuccess } from '@/utils/toast';
import { useTranslations } from 'next-intl';


const LoginForm = () => {
  const [showPass, setShowPass] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [login, { isLoading }] = useLoginMutation();
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split('/')[1]; // Получаем текущую локаль из URL
  const t = useTranslations('Common');

  // Динамическая схема валидации с переводами
  const schema = Yup.object().shape({
    email: Yup.string()
      .required(t('emailRequired'))
      .email(t('invalidEmail'))
      .label("Email"),
    password: Yup.string()
      .required(t('passwordRequired'))
      .min(6, t('minCharacters', { count: 6 }))
      .label("Password"),
  });

  // react hook form
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
  });
  // onSubmit
  const onSubmit = (data) => {
    setLoginError(''); // Очищаем предыдущие ошибки
    
    login({
      email: data.email,
      password: data.password,
      remember: data.remember || false
    })
      .unwrap()
      .then((response) => {
        notifySuccess(t('loginSuccess'));
        
        // Проверяем, есть ли параметр redirect в URL или localStorage
        const urlParams = new URLSearchParams(window.location.search);
        const redirectUrl = urlParams.get('redirect') || localStorage.getItem('redirectAfterLogin');
        
        if (redirectUrl) {
          // Очищаем сохраненный redirect
          localStorage.removeItem('redirectAfterLogin');
          router.push(redirectUrl);
        } else {
          // По умолчанию перенаправляем на главную страницу с учетом локали
          router.push(`/${locale}`);
        }
      })
      .catch((error) => {
        console.error('Login error details:', {
          error,
          errorData: error?.data,
          errorStatus: error?.status,
          errorMessage: error?.message,
          fullError: JSON.stringify(error, null, 2)
        });
        
        // Обработка различных типов ошибок с мультиязычными сообщениями
        let errorMessage = t('authenticationError');
        
        // RTK Query ошибки имеют структуру { status, data, error }
        if (error?.data) {
          if (error.data.detail) {
            // Проверяем на стандартные ошибки аутентификации
            if (error.data.detail.includes('Invalid credentials') || 
                error.data.detail.includes('Unable to log in') ||
                error.data.detail.includes('No active account')) {
              errorMessage = t('invalidCredentials');
            } else {
              errorMessage = error.data.detail;
            }
          } else if (error.data.non_field_errors) {
            const serverError = error.data.non_field_errors[0];
            if (serverError.includes('Invalid credentials') || 
                serverError.includes('Unable to log in')) {
              errorMessage = t('invalidCredentials');
            } else {
              errorMessage = serverError;
            }
          } else if (error.data.email) {
            errorMessage = `Email: ${error.data.email[0]}`;
          } else if (error.data.password) {
            errorMessage = `${t('password')}: ${error.data.password[0]}`;
          }
        } else if (error?.status === 401 || error?.status === 'PARSING_ERROR') {
          errorMessage = t('invalidCredentials');
        } else if (error?.status === 400) {
          errorMessage = t('checkInputData');
        } else if (error?.status >= 500) {
          errorMessage = t('serverError');
        } else if (error?.error) {
          // Обработка сетевых ошибок
          errorMessage = t('serverError');
        }
        
        setLoginError(errorMessage);
        notifyError(errorMessage);
      })
      .finally(() => {
        // Сбрасываем только пароль для безопасности
        reset({ password: '' }, { keepValues: true });
      });
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="tp-login-input-wrapper">
        <div className="tp-login-input-box">
          <div className="tp-login-input">
            <input {...register("email", { required: t('emailRequired') })} name="email" id="email" type="email" placeholder="AirBag@mail.com" />
          </div>
          <div className="tp-login-input-title">
            <label htmlFor="email">{t('yourEmail')}</label>
          </div>
          <ErrorMsg msg={errors.email?.message} />
        </div>
        <div className="tp-login-input-box">
          <div className="p-relative">
            <div className="tp-login-input">
              <input
                {...register("password", { required: t('passwordRequired') })}
                id="password"
                type={showPass ? "text" : "password"}
                placeholder={t('minCharacters', { count: 6 })}
              />
            </div>
            <div className="tp-login-input-eye" id="password-show-toggle">
              <span className="open-eye" onClick={() => setShowPass(!showPass)}>
                {showPass ? <CloseEye /> : <OpenEye />}
              </span>
            </div>
            <div className="tp-login-input-title">
              <label htmlFor="password">{t('password')}</label>
            </div>
          </div>
          <ErrorMsg msg={errors.password?.message}/>
        </div>
      </div>
      <div className="tp-login-suggetions d-sm-flex align-items-center justify-content-between mb-20">
        <div className="tp-login-remeber">
          <input id="remeber" type="checkbox" {...register("remember")} />
          <label htmlFor="remeber">{t('rememberMe')}</label>
        </div>
        <div className="tp-login-forgot">
          <Link href={`/${locale}/forgot`}>{t('forgotPassword')}</Link>
        </div>
      </div>
      <div className="tp-login-bottom">
        <button 
          type='submit' 
          className="tp-login-btn w-100" 
          disabled={isLoading}
        >
          {isLoading ? t('loggingIn') : t('login')}
        </button>
        {loginError && (
          <div className="tp-login-error mt-3">
            <div className="alert alert-danger" style={{ 
              backgroundColor: '#f8d7da', 
              borderColor: '#f5c6cb', 
              color: '#721c24',
              fontSize: '14px',
              padding: '10px 15px',
              borderRadius: '6px',
              border: '1px solid #f5c6cb',
              marginBottom: 0
            }}>
              <i className="fas fa-exclamation-triangle me-2" style={{ fontSize: '16px' }}></i>
              <span>{loginError}</span>
            </div>
          </div>
        )}
      </div>
    </form>
  );
};

export default LoginForm;