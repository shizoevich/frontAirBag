import React from 'react';
import RegisterPageContent from '@/components/register/register-page-content';

export async function generateMetadata({ params }) {
  // Используем await для получения locale, чтобы избежать ошибки
  // "Route used `params.locale`. `params` should be awaited before using its properties"
  const locale = await params.locale;
  return {
    title: `AirBag - ${locale === 'uk' ? 'Реєстрація' : locale === 'ru' ? 'Регистрация' : 'Register'} Page`,
  };
}

const RegisterPage = () => {
  return <RegisterPageContent />;
};

export default RegisterPage;
