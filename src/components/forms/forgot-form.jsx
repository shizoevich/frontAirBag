'use client';
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useLocale, useTranslations } from "next-intl";
// internal
import ErrorMsg from "../common/error-msg";
import { useRequestPasswordResetMutation } from "@/redux/features/auth/authApi";
import { notifyError, notifySuccess } from "@/utils/toast";

const ForgotForm = () => {
  const t = useTranslations("Common");
  const locale = useLocale();
  const [requestPasswordReset, { isLoading }] = useRequestPasswordResetMutation();
  const [sent, setSent] = useState(false);

  // Схема строится внутри компонента, иначе сообщения yup не переводятся.
  const schema = Yup.object().shape({
    email: Yup.string().required(t("emailRequired")).email(t("invalidEmail")).label("Email"),
  });

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    try {
      await requestPasswordReset({ email: data.email, locale }).unwrap();
      // Одно и то же сообщение независимо от того, есть такой аккаунт или нет —
      // иначе анти-энумерация на бэкенде теряет смысл.
      setSent(true);
      notifySuccess(t("resetLinkSent"));
      reset();
    } catch (error) {
      if (error?.status === 429) {
        notifyError(t("tooManyRequests"));
      } else if (error?.data?.email) {
        notifyError(error.data.email[0]);
      } else {
        notifyError(t("serverError"));
      }
    }
  };

  if (sent) {
    return (
      <div className="tp-login-input-wrapper text-center">
        <p style={{ marginBottom: 0 }}>{t("resetLinkSent")}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="tp-login-input-wrapper">
        <div className="tp-login-input-box">
          <div className="tp-login-input">
            <input
              {...register("email")}
              name="email"
              id="email"
              type="email"
              placeholder="AirBag@mail.com"
            />
          </div>
          <div className="tp-login-input-title">
            <label htmlFor="email">{t("yourEmail")}</label>
          </div>
          <ErrorMsg msg={errors.email?.message} />
        </div>
      </div>
      <div className="tp-login-bottom mb-15">
        <button type="submit" className="tp-login-btn w-100" disabled={isLoading}>
          {isLoading ? t("sending") : t("sendResetLink")}
        </button>
      </div>
    </form>
  );
};

export default ForgotForm;
