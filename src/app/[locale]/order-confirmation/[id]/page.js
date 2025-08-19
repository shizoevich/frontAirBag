import React from 'react';
import Wrapper from '@/layout/wrapper';
import Header from '@/layout/headers/header';
import Footer from '@/layout/footers/footer';
import OrderConfirmation from '@/components/order/order-confirmation';

export const metadata = {
  title: "Order Confirmation - Shofy",
  description: "Your order has been confirmed",
};

export default function OrderConfirmationPage({ params }) {
  return (
    <Wrapper>
      <Header />
      <main>
        <OrderConfirmation orderId={params.id} />
      </main>
      <Footer />
    </Wrapper>
  );
}
