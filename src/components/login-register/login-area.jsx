'use client'
import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
// internal
import LoginForm from "../forms/login-form";
import LoginShapes from "./login-shapes";
import GoogleSignUp from "./google-sign-up";
import { useTelegramAutoLinkMutation } from '@/redux/features/auth/authApi';
import useTelegramWebApp from '@/hooks/use-telegram-webapp';

const LoginArea = () => {
  const t = useTranslations('Common');
  const { locale } = useParams();
  const router = useRouter();
  const { accessToken, isGuest, user } = useSelector((state) => state.auth);
  const [telegramAutoLink] = useTelegramAutoLinkMutation();
  const { rawInitData, hasInitData } = useTelegramWebApp();
  const autoLinkAttempted = useRef(false);

  // Auto-link Telegram after login — only if:
  // 1. logged in as real user (not guest)
  // 2. user profile confirms no telegram_id yet
  // 3. we have valid initData from Telegram WebApp
  useEffect(() => {
    if (!accessToken || isGuest) return;
    if (!hasInitData || !rawInitData) return;
    // Wait until user profile is loaded to check telegram_id
    if (user === null) return;
    if (user?.telegram_id) return; // already linked — don't touch it
    if (autoLinkAttempted.current) return;

    autoLinkAttempted.current = true;
    telegramAutoLink({ rawInitData }).catch(() => null);
  }, [accessToken, isGuest, user, hasInitData, rawInitData, telegramAutoLink]);

  useEffect(() => {
    // Гостей не редиректим — они могут зайти по email/паролю
    if (!accessToken || isGuest) return;
    const redirect = typeof window !== 'undefined'
      ? localStorage.getItem('redirectAfterLogin')
      : null;
    if (redirect) {
      localStorage.removeItem('redirectAfterLogin');
      const isAuthPage = redirect.includes('/login') || redirect.includes('/register');
      router.replace(isAuthPage ? `/${locale}` : redirect);
    } else {
      router.replace(`/${locale}`);
    }
  }, [accessToken, isGuest, router, locale]);

  return (
    <>
      <section className="tp-login-area pb-140 p-relative z-index-1 fix">
        <LoginShapes />
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-xl-6 col-lg-8">
              <div className="tp-login-wrapper">
                <div className="tp-login-top text-center mb-30">
                  <h3 className="tp-login-title">{t('loginToAirBag')}</h3>
                  <p>
                    {t('dontHaveAccount')}{" "}
                    <span>
                      <Link href={`/${locale}/register`}>{t('createFreeAccount')}</Link>
                    </span>
                  </p>
                </div>
                <div className="tp-login-option">
                  <LoginForm />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default LoginArea;
