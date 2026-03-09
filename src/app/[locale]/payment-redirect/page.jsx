import React, { Suspense } from 'react';
import PaymentRedirectClient from './PaymentRedirectClient';

export default function PaymentRedirectPage() {
  // useSearchParams requires a suspense boundary in Next 15+.
  return (
    <Suspense fallback={null}>
      <PaymentRedirectClient />
    </Suspense>
  );
}
