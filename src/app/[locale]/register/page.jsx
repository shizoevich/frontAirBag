import React from 'react';
import RegisterPageContent from '@/components/register/register-page-content';

export async function generateMetadata({ params }) {
  const { locale } = params;
  return {
    title: `AirBag - ${locale === 'uk' ? 'Реєстрація' : locale === 'ru' ? 'Регистрация' : 'Register'} Page`,
  };
}

const RegisterPage = () => {
  return <RegisterPageContent />;
};

export default RegisterPage;
