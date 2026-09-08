import React from 'react';
import Wrapper from '@/layout/wrapper';
import Header from '@/layout/headers/header';
import Footer from '@/layout/footers/footer';
import AuthGuard from '@/components/auth/auth-guard';
import OrderCheckoutArea from '@/components/checkout/order-checkout-area';
import { NOINDEX } from '@/utils/seo';

export const metadata = {
  title: "Checkout - Shofy",
  description: "Complete your order",
  robots: NOINDEX,
};

// Оформление — только под аккаунтом: анонима уводим на вход, корзина в
// localStorage переживает переход (ADR-0021).
export default function Checkout() {
  return (
    <Wrapper>
      <Header />
      <main>
        <AuthGuard requireAuth={true}>
          <OrderCheckoutArea />
        </AuthGuard>
      </main>
      <Footer />
    </Wrapper>
  );
}
