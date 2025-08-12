'use client'
import React from "react";
import Link from "next/link";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
// internal
import LoginForm from "../forms/login-form";
import LoginShapes from "./login-shapes";
import GoogleSignUp from "./google-sign-up";

const LoginArea = () => {
  const t = useTranslations('Common');
  const { locale } = useParams();

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
                  <div className="tp-login-social mb-10 d-flex flex-wrap align-items-center justify-content-center">
                    <div className="tp-login-option-item has-google">
                      <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID">
                        <GoogleSignUp/>
                      </GoogleOAuthProvider>
                    </div>
                  </div>
                  <div className="tp-login-mail text-center mb-40">
                    <p>
                      {t('orSignInWith')} <a href="#">{t('email')}</a>
                    </p>
                  </div>
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
