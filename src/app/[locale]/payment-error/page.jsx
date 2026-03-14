import React, { Suspense } from 'react';
import PaymentErrorClient from './PaymentErrorClient';

export default function PaymentErrorPage() {
  return (
    <Suspense fallback={null}>
      <PaymentErrorClient />
    </Suspense>
  );
}

