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


// schema
const schema = Yup.object().shape({
  email: Yup.string()
    .required("Email обязателен для заполнения")
    .email("Введите корректный email адрес")
    .label("Email"),
  password: Yup.string()
    .required("Пароль обязателен для заполнения")
    .min(6, "Пароль должен содержать минимум 6 символов")
    .label("Password"),
});
const LoginForm = () => {
  const [showPass, setShowPass] = useState(false);
  const [login, { isLoading }] = useLoginMutation();
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split('/')[1]; // Получаем текущую локаль из URL
  const t = useTranslations('Common');
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
    login({
      email: data.email,
      password: data.password,
      remember: data.remember || false
    })
      .unwrap()
      .then((response) => {
        notifySuccess(t('loginSuccess'));
        // После успешного логина перенаправляем на главную страницу с учетом локали
        router.push(`/${locale}`);
      })
      .catch((error) => {
        console.error('Login error:', error);
        
        // Обработка различных типов ошибок
        let errorMessage = t('loginFailed');
        
        if (error?.data) {
          if (error.data.detail) {
            errorMessage = error.data.detail;
          } else if (error.data.non_field_errors) {
            errorMessage = error.data.non_field_errors[0];
          } else if (error.data.email) {
            errorMessage = `Email: ${error.data.email[0]}`;
          } else if (error.data.password) {
            errorMessage = `Пароль: ${error.data.password[0]}`;
          }
        } else if (error?.status === 401) {
          errorMessage = "Неверный email или пароль";
        } else if (error?.status === 400) {
          errorMessage = "Проверьте правильность введенных данных";
        } else if (error?.status >= 500) {
          errorMessage = "Ошибка сервера. Попробуйте позже";
        }
        
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
      </div>
    </form>
  );
};

export default LoginForm;