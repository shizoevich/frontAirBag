'use client';
import React from 'react';
import Wrapper from '@/layout/wrapper';
import Header from '@/layout/headers/header';
import Footer from '@/layout/footers/footer';
import OrderPage from '@/components/order/order-page';
import AuthGuard from '@/components/auth/auth-guard';
import SEO from '@/components/seo';
import { useTranslations } from 'next-intl';

export default function Orders() {
  const t = useTranslations('Profile');
  
  return (
    <Wrapper>
      <SEO pageTitle={t('myOrders')} />
      <Header />
      <main>
        {/* requireAuth=true (не "user"): гости с заказами тоже должны видеть свои заказы.
            Бэкенд (get_own_queryset) уже фильтрует заказы по client=request.user. */}
        <AuthGuard requireAuth={true}>
          <OrderPage />
        </AuthGuard>
      </main>
      <Footer />
    </Wrapper>
  );
}
