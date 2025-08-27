'use client';
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { useRouter,redirect } from "next/navigation";
// internal
import { CloseEye, OpenEye } from "@/svg";
import ErrorMsg from "../common/error-msg";
import { notifyError, notifySuccess } from "@/utils/toast";
import { useRegisterUserMutation } from "@/redux/features/auth/authApi";

// schema
const schema = Yup.object().shape({
  name: Yup.string()
    .required("Имя обязательно для заполнения")
    .min(2, "Имя должно содержать минимум 2 символа")
    .label("Name"),
  email: Yup.string()
    .required("Email обязателен для заполнения")
    .email("Введите корректный email адрес")
    .label("Email"),
  password: Yup.string()
    .required("Пароль обязателен для заполнения")
    .min(6, "Пароль должен содержать минимум 6 символов")
    .matches(/^(?=.*[a-zA-Z])(?=.*\d)/, "Пароль должен содержать буквы и цифры")
    .label("Password"),
  remember: Yup.bool()
    .oneOf([true], "Необходимо согласиться с условиями использования")
    .label("Terms and Conditions"),
});

const RegisterForm = () => {
  const [showPass, setShowPass] = useState(false);
  const [registerUser, {}] = useRegisterUserMutation();
  const router = useRouter();
  // react hook form
  const {register,handleSubmit,formState: { errors },reset} = useForm({
    resolver: yupResolver(schema),
  });
  // on submit
  const onSubmit = (data) => {
    registerUser({
      name: data.name,
      email: data.email,
      password: data.password,
      confirm_password: data.password,
    })
      .unwrap()
      .then((result) => {
        notifySuccess(result?.message || "Регистрация прошла успешно!");
        router.push('/checkout');
      })
      .catch((error) => {
        console.error('Registration error:', error);
        
        // Обработка различных типов ошибок
        let errorMessage = "Ошибка регистрации";
        
        if (error?.data) {
          if (error.data.email) {
            errorMessage = `Email: ${error.data.email[0]}`;
          } else if (error.data.password) {
            errorMessage = `Пароль: ${error.data.password[0]}`;
          } else if (error.data.name) {
            errorMessage = `Имя: ${error.data.name[0]}`;
          } else if (error.data.non_field_errors) {
            errorMessage = error.data.non_field_errors[0];
          } else if (error.data.detail) {
            errorMessage = error.data.detail;
          }
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
          Sign Up
        </button>
      </div>
    </form>
  );
};

export default RegisterForm;
