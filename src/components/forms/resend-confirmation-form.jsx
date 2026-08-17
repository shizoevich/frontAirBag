'use client';
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useTranslations } from "next-intl";
// internal
import ErrorMsg from "../common/error-msg";

const ResendConfirmationForm = ({ defaultEmail = "", isLoading, onResend }) => {
  const t = useTranslations("Common");
  const [sent, setSent] = useState(false);

  // Схема строится внутри компонента, иначе сообщения yup не переводятся.
  const schema = Yup.object().shape({
    email: Yup.string().required(t("emailRequired")).email(t("invalidEmail")).label("Email"),
  });

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { email: defaultEmail },
  });

  const onSubmit = async (data) => {
    const ok = await onResend(data.email);
    // Одно и то же подтверждение независимо от того, есть аккаунт или нет —
    // иначе анти-энумерация на бэкенде теряет смысл.
    if (ok) setSent(true);
  };

  if (sent) {
    return (
      <div className="tp-login-input-wrapper text-center">
        <p style={{ marginBottom: 0 }}>{t("confirmationResent")}</p>
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
          {isLoading ? t("sending") : t("resendConfirmation")}
        </button>
      </div>
    </form>
  );
};

export default ResendConfirmationForm;
