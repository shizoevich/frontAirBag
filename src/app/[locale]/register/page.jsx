import React from 'react';
import RegisterPageContent from '@/components/register/register-page-content';
import { NOINDEX } from '@/utils/seo';

export async function generateMetadata({ params }) {
  // Используем await для получения locale, чтобы избежать ошибки
  // "Route used `params.locale`. `params` should be awaited before using its properties"
  const locale = await params.locale;
  return {
    title: `AirBag - ${locale === 'uk' ? 'Реєстрація' : locale === 'ru' ? 'Регистрация' : 'Register'} Page`,
    robots: NOINDEX,
  };
}

const RegisterPage = () => {
  return <RegisterPageContent />;
};

export default RegisterPage;
