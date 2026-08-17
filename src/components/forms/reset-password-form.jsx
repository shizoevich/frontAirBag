'use client';
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { useLocale, useTranslations } from "next-intl";
// internal
import ErrorMsg from "../common/error-msg";
import { CloseEye, OpenEye } from "@/svg";
import { useConfirmPasswordResetMutation } from "@/redux/features/auth/authApi";
import { notifyError, notifySuccess } from "@/utils/toast";

const ResetPasswordForm = ({ uid, token, onInvalidLink }) => {
  const t = useTranslations("Common");
  const locale = useLocale();
  const router = useRouter();
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [confirmPasswordReset, { isLoading }] = useConfirmPasswordResetMutation();

  const schema = Yup.object().shape({
    password: Yup.string()
      .required(t("passwordRequired"))
      .min(6, t("minCharacters", { count: 6 }))
      .label("Password"),
    confirmPassword: Yup.string()
      .required(t("confirmPasswordRequired"))
      .oneOf([Yup.ref("password")], t("passwordsMustMatch")),
  });

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    try {
      await confirmPasswordReset({ uid, token, new_password: data.password }).unwrap();
      notifySuccess(t("passwordResetSuccess"));
      router.replace(`/${locale}/login`);
    } catch (error) {
      if (error?.data?.code === "invalid_token") {
        // Токен протух или уже использован — форму дальше показывать бессмысленно.
        onInvalidLink?.();
        notifyError(t("invalidOrExpiredLink"));
      } else if (error?.data?.new_password) {
        // Бэкенд прогоняет пароль через AUTH_PASSWORD_VALIDATORS, они строже,
        // чем min(6) выше: слишком простой или полностью числовой не пройдёт.
        notifyError(error.data.new_password[0]);
      } else if (error?.status === 429) {
        notifyError(t("tooManyRequests"));
      } else {
        notifyError(t("serverError"));
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="tp-login-input-wrapper">
        <div className="tp-login-input-box">
          <div className="p-relative">
            <div className="tp-login-input">
              <input
                {...register("password")}
                id="password"
                type={showPass ? "text" : "password"}
                placeholder={t("minCharacters", { count: 6 })}
              />
            </div>
            <div className="tp-login-input-eye" id="password-show-toggle">
              <span className="open-eye" onClick={() => setShowPass(!showPass)}>
                {showPass ? <CloseEye /> : <OpenEye />}
              </span>
            </div>
            <div className="tp-login-input-title">
              <label htmlFor="password">{t("newPassword")}</label>
            </div>
          </div>
          <ErrorMsg msg={errors.password?.message} />
        </div>

        <div className="tp-login-input-box">
          <div className="p-relative">
            <div className="tp-login-input">
              <input
                {...register("confirmPassword")}
                id="confirmPassword"
                type={showConfirmPass ? "text" : "password"}
                placeholder={t("confirmPassword")}
              />
            </div>
            <div className="tp-login-input-eye" id="confirm-password-show-toggle">
              <span className="open-eye" onClick={() => setShowConfirmPass(!showConfirmPass)}>
                {showConfirmPass ? <CloseEye /> : <OpenEye />}
              </span>
            </div>
            <div className="tp-login-input-title">
              <label htmlFor="confirmPassword">{t("confirmPassword")}</label>
            </div>
          </div>
          <ErrorMsg msg={errors.confirmPassword?.message} />
        </div>
      </div>

      <div className="tp-login-bottom">
        <button type="submit" className="tp-login-btn w-100" disabled={isLoading}>
          {isLoading ? t("saving") : t("savePassword")}
        </button>
      </div>
    </form>
  );
};

export default ResetPasswordForm;
