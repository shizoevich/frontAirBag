import React, { Suspense } from 'react';
import PaymentErrorClient from './PaymentErrorClient';

import { NOINDEX } from '@/utils/seo';

// Transactional step — never indexable.
export const metadata = { robots: NOINDEX };

export default function PaymentErrorPage() {
  return (
    <Suspense fallback={null}>
      <PaymentErrorClient />
    </Suspense>
  );
}

