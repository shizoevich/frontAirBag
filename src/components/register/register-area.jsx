'use client';
import React from "react";
import Link from "next/link";
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
// internal
import RegisterForm from "./register-form";
import LoginShapes from "../login-register/login-shapes";

const RegisterArea = () => {
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
                  <h3 className="tp-login-title">{t('registerToAirBag')}</h3>
                  <p>
                    {t('alreadyHaveAccount')}{" "}
                    <span>
                      <Link href={`/${locale}/login`}>{t('signIn')}</Link>
                    </span>
                  </p>
                </div>
                <div className="tp-login-option">
                  <RegisterForm />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default RegisterArea;
