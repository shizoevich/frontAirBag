import React from 'react';
import Wrapper from '@/layout/wrapper';
import Header from '@/layout/headers/header';
import Footer from '@/layout/footers/footer';
import OrderCheckoutArea from '@/components/checkout/order-checkout-area';
import { NOINDEX } from '@/utils/seo';

export const metadata = {
  title: "Checkout - Shofy",
  description: "Complete your order",
  robots: NOINDEX,
};

export default function Checkout() {
  return (
    <Wrapper>
      <Header />
      <main>
        <OrderCheckoutArea />
      </main>
      <Footer />
    </Wrapper>
  );
}
