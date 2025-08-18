'use client';
import React from 'react';
import Wrapper from "@/layout/wrapper";
import Header from "@/layout/headers/header";
import Footer from "@/layout/footers/footer";
import SEO from "@/components/seo";
import { useTranslations } from 'next-intl';
import UserProfileArea from '@/components/profile/user-profile-area';

export default function ProfilePage() {
  const t = useTranslations('Profile');
  
  return (
    <Wrapper>
      <SEO pageTitle={t('profilePage')} />
      <Header />
      <UserProfileArea />
      <Footer style_2={true} />
    </Wrapper>
  );
}
