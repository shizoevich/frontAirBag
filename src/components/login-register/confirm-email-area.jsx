'use client';
import Link from 'next/link';
import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import LoginShapes from './login-shapes';
import ResendConfirmationForm from '../forms/resend-confirmation-form';
import {
  useConfirmEmailMutation,
  useResendEmailConfirmationMutation,
} from '@/redux/features/auth/authApi';
import { notifyError, notifySuccess } from '@/utils/toast';

// Одна страница на два сценария:
//   ?token=...  — пришли по ссылке из письма, подтверждаем;
//   без токена  — экран «проверьте почту» после регистрации или из формы входа.
//
// useSearchParams переводит компонент в client-only рендер, поэтому страница
// обязана обернуть его в <Suspense> — иначе next build падает на пререндере.
const ConfirmEmailArea = () => {
  const t = useTranslations('Common');
  const locale = useLocale();
  const searchParams = useSearchParams();

  const token = searchParams.get('token');
  const emailFromQuery = searchParams.get('email') || '';

  const [confirmEmail] = useConfirmEmailMutation();
  const [resendEmailConfirmation, { isLoading: isResending }] =
    useResendEmailConfirmationMutation();

  // idle | pending | success | error
  const [status, setStatus] = useState(token ? 'pending' : 'idle');
  // В dev React monta компонент дважды — без этого флага письмо подтверждалось
  // бы двумя запросами подряд.
  const startedRef = useRef(false);

  useEffect(() => {
    if (!token || startedRef.current) return;
    startedRef.current = true;

    confirmEmail({ token })
      .unwrap()
      .then(() => {
        setStatus('success');
        notifySuccess(t('emailConfirmedSuccess'));
      })
      .catch(() => {
        setStatus('error');
      });
  }, [token, confirmEmail, t]);

  const resendForEmail = async (email) => {
    try {
      await resendEmailConfirmation({ email, locale }).unwrap();
      notifySuccess(t('confirmationResent'));
      return true;
    } catch (error) {
      if (error?.status === 429) {
        notifyError(t('tooManyRequests'));
      } else if (error?.data?.email) {
        notifyError(error.data.email[0]);
      } else {
        notifyError(t('serverError'));
      }
      return false;
    }
  };

  let title = t('checkYourEmailTitle');
  let subtitle = t('checkYourEmailSubtitle');
  if (status === 'pending') {
    title = t('confirmingEmailTitle');
    subtitle = t('confirmingEmailSubtitle');
  } else if (status === 'success') {
    title = t('emailConfirmedTitle');
    subtitle = t('emailConfirmedSubtitle');
  } else if (status === 'error') {
    title = t('confirmationFailedTitle');
    subtitle = t('invalidOrExpiredLink');
  }

  return (
    <section className="tp-login-area pb-140 p-relative z-index-1 fix">
      <LoginShapes />
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-xl-6 col-lg-8">
            <div className="tp-login-wrapper">
              <div className="tp-login-top text-center mb-30">
                <h3 className="tp-login-title">{title}</h3>
                <p>{subtitle}</p>
              </div>
              <div className="tp-login-option">
                {status === 'success' && (
                  <div className="tp-login-bottom mb-15">
                    <Link
                      className="tp-login-btn w-100 d-block text-center"
                      href={`/${locale}/login`}
                    >
                      {t('login')}
                    </Link>
                  </div>
                )}

                {(status === 'idle' || status === 'error') && (
                  <ResendConfirmationForm
                    defaultEmail={emailFromQuery}
                    isLoading={isResending}
                    onResend={resendForEmail}
                  />
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

export default ConfirmEmailArea;
