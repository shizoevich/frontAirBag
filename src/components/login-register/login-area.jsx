'use client'
import React, { useEffect } from "react";
import Link from "next/link";
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
// internal
import LoginForm from "../forms/login-form";
import LoginShapes from "./login-shapes";

const LoginArea = () => {
  const t = useTranslations('Common');
  const { locale } = useParams();
  const router = useRouter();
  const { accessToken } = useSelector((state) => state.auth);

  // Привязку Telegram после входа делает сама мутация login — здесь только
  // возврат туда, откуда человека увели на вход.
  useEffect(() => {
    if (!accessToken) return;
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
  }, [accessToken, router, locale]);

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
                {/* Старые Telegram-записи без почты и пароля: входить им — через бота. */}
                <p className="text-center mt-20" style={{ fontSize: 13, color: '#6c757d' }}>
                  {t('noPasswordHint')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default LoginArea;
