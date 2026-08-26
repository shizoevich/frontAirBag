'use client';
import Link from 'next/link';
import React, { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import LoginShapes from './login-shapes';
import ClaimAccountForm from '../forms/claim-account-form';
import { useGetAccountClaimQuery } from '@/redux/features/auth/authApi';

// Страница для клиентов, приехавших из старой версии бота. У них нет почты —
// в старой системе её не спрашивали, — поэтому ни войти, ни восстановить
// пароль они не могут. Код в адресе приходит персональной ссылкой в Telegram
// и служит доказательством личности: чат привязан к аккаунту ещё с тех пор.
const ClaimAccountArea = ({ code }) => {
  const t = useTranslations('Common');
  const locale = useLocale();
  const { data, isLoading, isError } = useGetAccountClaimQuery(code);
  const [done, setDone] = useState(false);

  let title = t('claimTitle');
  let subtitle = t('claimSubtitle');
  if (isError) {
    title = t('claimInvalidLink');
    subtitle = t('claimInvalidLinkText');
  } else if (done) {
    title = t('claimSuccessTitle');
    subtitle = t('claimSuccessText');
  } else if (data?.already_claimed) {
    title = t('claimAlreadyDone');
    subtitle = t('claimAlreadyDoneText');
  }

  const showForm = !isLoading && !isError && !done && !data?.already_claimed;

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

              {showForm && (
                <div className="tp-login-option">
                  {/* «Это вы?»: узнаваемые приметы без выдачи контактов —
                      страница публичная, телефон приходит замаскированным. */}
                  <div className="tp-login-input-box mb-20">
                    <p className="mb-5">
                      <strong>
                        {data?.name} {data?.last_name}
                      </strong>
                    </p>
                    {data?.phone_hint && (
                      <p className="mb-5">
                        {t('claimPhoneHint', { phone: data.phone_hint })}
                      </p>
                    )}
                    <p className="mb-5">
                      {t('claimOrdersCount', { count: data?.orders_count ?? 0 })}
                    </p>
                    {data?.discount_percentage > 0 && (
                      <p className="mb-5">
                        {t('claimDiscount', { percent: data.discount_percentage })}
                      </p>
                    )}
                  </div>

                  <ClaimAccountForm code={code} onDone={() => setDone(true)} />
                </div>
              )}

              {(done || data?.already_claimed) && (
                <div className="tp-login-bottom mb-15">
                  <Link
                    className="tp-login-btn w-100 d-block text-center"
                    href={`/${locale}/login`}
                  >
                    {t('login')}
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
    </section>
  );
};

export default ClaimAccountArea;
