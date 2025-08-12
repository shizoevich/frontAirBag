'use client';
import React from 'react';
import { useTranslations } from 'next-intl';
import SEO from '@/components/seo';
import Wrapper from '@/layout/wrapper';
import CommonBreadcrumb from '@/components/breadcrumb/common-breadcrumb';
import RegisterArea from '@/components/register/register-area';

const RegisterPageContent = () => {
  const t = useTranslations('Common');
  
  return (
    <Wrapper>
      <SEO pageTitle={t('register')} />
      <CommonBreadcrumb title="register" subtitle="register" />
      <RegisterArea />
    </Wrapper>
  );
};

export default RegisterPageContent;
