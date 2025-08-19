import React from 'react';
import Wrapper from '@/layout/wrapper';
import Header from '@/layout/headers/header';
import Footer from '@/layout/footers/footer';
import OrderPage from '@/components/order/order-page';
import { useTranslations } from 'next-intl';

export const metadata = {
  title: "My Orders - Shofy",
  description: "View and manage your orders",
};

export default function Orders() {
  return (
    <Wrapper>
      <Header />
      <main>
        <OrderPage />
      </main>
      <Footer />
    </Wrapper>
  );
}
