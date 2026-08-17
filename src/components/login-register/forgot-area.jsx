'use client';
import Link from 'next/link';
import React from 'react';
import { useLocale, useTranslations } from 'next-intl';
import ForgotForm from '../forms/forgot-form';
import LoginShapes from './login-shapes';

const ForgotArea = () => {
  const locale = useLocale();
  const t = useTranslations('Common');

  return (
    <section className="tp-login-area pb-140 p-relative z-index-1 fix">
      <LoginShapes />
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-xl-6 col-lg-8">
            <div className="tp-login-wrapper">
              <div className="tp-login-top text-center mb-30">
                <h3 className="tp-login-title">{t('resetPasswordTitle')}</h3>
                <p>{t('resetPasswordSubtitle')}</p>
              </div>
              <div className="tp-login-option">
                <ForgotForm />
                <div className="tp-login-suggetions d-sm-flex align-items-center justify-content-center">
                  <div className="tp-login-forgot">
                    <span>
                      {t('rememberPassword')}{' '}
                      <Link href={`/${locale}/login`}>{t('login')}</Link>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ForgotArea;
