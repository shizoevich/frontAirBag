'use client';
import React from 'react';
import Wrapper from "@/layout/wrapper";
import Header from "@/layout/headers/header";
import Footer from "@/layout/footers/footer";
import SEO from "@/components/seo";
import { useTranslations } from 'next-intl';
import CabinetArea from '@/components/cabinet/cabinet-area';
import AuthGuard from '@/components/auth/auth-guard';

export default function CabinetPage() {
  const t = useTranslations('Profile');

  return (
    <Wrapper>
      <SEO pageTitle={t('myAccount')} />
      <Header />
      <AuthGuard requireAuth="user">
        <CabinetArea />
      </AuthGuard>
      <Footer style_2={true} />
    </Wrapper>
  );
}
