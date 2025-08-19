import React from 'react';
import Wrapper from '@/layout/wrapper';
import Header from '@/layout/headers/header';
import Footer from '@/layout/footers/footer';
import PaymentStub from '@/components/payment/payment-stub';

export const metadata = {
  title: "Payment - Shofy",
  description: "Complete your payment",
};

export default function PaymentPage({ params }) {
  return (
    <Wrapper>
      <Header />
      <main>
        <PaymentStub orderId={params.id} />
      </main>
      <Footer />
    </Wrapper>
  );
}
