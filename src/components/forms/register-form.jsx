'use client';
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { useRouter, usePathname } from "next/navigation";
// internal
import { CloseEye, OpenEye } from "@/svg";
import ErrorMsg from "../common/error-msg";
import { notifyError, notifySuccess } from "@/utils/toast";
import { useRegisterUserMutation } from "@/redux/features/auth/authApi";
import { useTranslations } from 'next-intl';

const RegisterForm = () => {
  const [showPass, setShowPass] = useState(false);
  const [registerError, setRegisterError] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState('');
  const [registerUser, {}] = useRegisterUserMutation();
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split('/')[1]; // Получаем текущую локаль из URL
  const t = useTranslations('Common');

  // Динамическая схема валидации с переводами
  const schema = Yup.object().shape({
    name: Yup.string()
      .required(t('firstNameRequired'))
      .min(2, t('minCharacters', { count: 2 }))
      .label("Name"),
    email: Yup.string()
      .required(t('emailRequired'))
      .email(t('invalidEmail'))
      .label("Email"),
    password: Yup.string()
      .required(t('passwordRequired'))
      .min(6, t('minCharacters', { count: 6 }))
      .matches(/^(?=.*[a-zA-Z])(?=.*\d)/, t('passwordLettersAndNumbers'))
      .label("Password"),
    remember: Yup.bool()
      .oneOf([true], t('agreeToTerms'))
      .label("Terms and Conditions"),
  });

  // react hook form
  const {register,handleSubmit,formState: { errors },reset} = useForm({
    resolver: yupResolver(schema),
  });
  // on submit
  const onSubmit = (data) => {
    setRegisterError(''); // Очищаем предыдущие ошибки
    setRegisterSuccess(''); // Очищаем предыдущие сообщения об успехе
    
    registerUser({
      name: data.name,
      email: data.email,
      password: data.password,
      confirm_password: data.password,
    })
      .unwrap()
      .then((result) => {
        // Показываем детальное сообщение об успешной регистрации
        const successMessage = result?.message || t('registerSuccessMessage');
        setRegisterSuccess(successMessage);
        notifySuccess(successMessage);
        
        // Небольшая задержка перед перенаправлением для показа сообщения
        setTimeout(() => {
          router.push(`/${locale}/checkout`);
        }, 2000);
      })
      .catch((error) => {
        console.error('Registration error details:', {
          error,
          errorData: error?.data,
          errorStatus: error?.status,
          errorMessage: error?.message,
          fullError: JSON.stringify(error, null, 2)
        });
        
        // Обработка различных типов ошибок с мультиязычными сообщениями
        let errorMessage = t('registrationError');
        
        // RTK Query ошибки имеют структуру { status, data, error }
        if (error?.data) {
          if (error.data.email) {
            const emailError = error.data.email[0];
            if (emailError.includes('already exists') || 
                emailError.includes('уже существует') ||
                emailError.includes('вже існує')) {
              errorMessage = t('emailAlreadyExists');
            } else {
              errorMessage = `Email: ${emailError}`;
            }
          } else if (error.data.phone) {
            const phoneError = error.data.phone[0];
            if (phoneError.includes('already exists') || 
                phoneError.includes('уже существует') ||
                phoneError.includes('вже існує')) {
              errorMessage = t('phoneAlreadyExists');
            } else {
              errorMessage = `${t('phoneNumber')}: ${phoneError}`;
            }
          } else if (error.data.password) {
            errorMessage = `${t('password')}: ${error.data.password[0]}`;
          } else if (error.data.name) {
            errorMessage = `${t('firstName')}: ${error.data.name[0]}`;
          } else if (error.data.non_field_errors) {
            const serverError = error.data.non_field_errors[0];
            if (serverError.includes('already exists') || 
                serverError.includes('уже существует') ||
                serverError.includes('вже існує')) {
              errorMessage = t('userAlreadyExists');
            } else {
              errorMessage = serverError;
            }
          } else if (error.data.detail) {
            errorMessage = error.data.detail;
          }
        } else if (error?.status === 400 || error?.status === 'PARSING_ERROR') {
          errorMessage = t('checkInputData');
        } else if (error?.status >= 500) {
          errorMessage = t('serverError');
        } else if (error?.error) {
          // Обработка сетевых ошибок
          errorMessage = t('serverError');
        }
        
        setRegisterError(errorMessage);
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
            <input
              {...register("name", { required: `Name is required!` })}
              id="name"
              name="name"
              type="text"
              placeholder="Shahnewaz Sakil"
            />
          </div>
          <div className="tp-login-input-title">
            <label htmlFor="name">Your Name</label>
          </div>
          <ErrorMsg msg={errors.name?.message} />
        </div>
        <div className="tp-login-input-box">
          <div className="tp-login-input">
            <input
              {...register("email", { required: `Email is required!` })}
              id="email"
              name="email"
              type="email"
              placeholder="AirBag@mail.com"
            />
          </div>
          <div className="tp-login-input-title">
            <label htmlFor="email">Your Email</label>
          </div>
          <ErrorMsg msg={errors.email?.message} />
        </div>
        <div className="tp-login-input-box">
          <div className="p-relative">
            <div className="tp-login-input">
              <input
                {...register("password", { required: `Password is required!` })}
                id="password"
                name="password"
                type={showPass ? "text" : "password"}
                placeholder="Min. 6 character"
              />
            </div>
            <div className="tp-login-input-eye" id="password-show-toggle">
              <span className="open-eye" onClick={() => setShowPass(!showPass)}>
                {showPass ? <CloseEye /> : <OpenEye />}
              </span>
            </div>
            <div className="tp-login-input-title">
              <label htmlFor="password">Password</label>
            </div>
          </div>
          <ErrorMsg msg={errors.password?.message} />
        </div>
      </div>
      <div className="tp-login-suggetions d-sm-flex align-items-center justify-content-between mb-20">
        <div className="tp-login-remeber">
          <input
            {...register("remember", {
              required: `Terms and Conditions is required!`,
            })}
            id="remember"
            name="remember"
            type="checkbox"
          />
          <label htmlFor="remember">
            I accept the terms of the Service & <a href="#">Privacy Policy</a>.
          </label>
          <ErrorMsg msg={errors.remember?.message} />
        </div>
      </div>
      <div className="tp-login-bottom">
        <button type="submit" className="tp-login-btn w-100">
          {t('register')}
        </button>
        {registerSuccess && (
          <div className="tp-register-success mt-3">
            <div className="alert alert-success" style={{ 
              backgroundColor: '#d4edda', 
              borderColor: '#c3e6cb', 
              color: '#155724',
              fontSize: '14px',
              padding: '10px 15px',
              borderRadius: '6px',
              border: '1px solid #c3e6cb',
              marginBottom: 0
            }}>
              <i className="fas fa-check-circle me-2" style={{ fontSize: '16px' }}></i>
              <span>{registerSuccess}</span>
            </div>
          </div>
        )}
        {registerError && (
          <div className="tp-register-error mt-3">
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
              <span>{registerError}</span>
            </div>
          </div>
        )}
      </div>
    </form>
  );
};

export default RegisterForm;
