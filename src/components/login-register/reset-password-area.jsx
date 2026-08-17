'use client';
import Link from 'next/link';
import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import ResetPasswordForm from '../forms/reset-password-form';
import LoginShapes from './login-shapes';

// useSearchParams переводит компонент в client-only рендер, поэтому страница
// обязана обернуть его в <Suspense> — иначе next build падает на пререндере.
const ResetPasswordArea = () => {
  const t = useTranslations('Common');
  const locale = useLocale();
  const searchParams = useSearchParams();
  const [linkDead, setLinkDead] = useState(false);

  const uid = searchParams.get('uid');
  const token = searchParams.get('token');
  const linkUsable = Boolean(uid && token) && !linkDead;

  return (
    <section className="tp-login-area pb-140 p-relative z-index-1 fix">
      <LoginShapes />
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-xl-6 col-lg-8">
            <div className="tp-login-wrapper">
              <div className="tp-login-top text-center mb-30">
                <h3 className="tp-login-title">{t('setNewPasswordTitle')}</h3>
                <p>{linkUsable ? t('setNewPasswordSubtitle') : t('invalidOrExpiredLink')}</p>
              </div>
              <div className="tp-login-option">
                {linkUsable ? (
                  <ResetPasswordForm
                    uid={uid}
                    token={token}
                    onInvalidLink={() => setLinkDead(true)}
                  />
                ) : (
                  <div className="tp-login-bottom mb-15">
                    <Link className="tp-login-btn w-100 d-block text-center" href={`/${locale}/forgot`}>
                      {t('requestNewLink')}
                    </Link>
                  </div>
                )}
                <div className="tp-login-suggetions d-sm-flex align-items-center justify-content-center">
                  <div className="tp-login-forgot">
                    <Link href={`/${locale}/login`}>{t('backToLogin')}</Link>
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

export default ResetPasswordArea;
