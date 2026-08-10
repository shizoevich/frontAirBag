import React, { Suspense } from 'react';
import PaymentRedirectClient from './PaymentRedirectClient';

import { NOINDEX } from '@/utils/seo';

// Transactional step — never indexable.
export const metadata = { robots: NOINDEX };

export default function PaymentRedirectPage() {
  // useSearchParams requires a suspense boundary in Next 15+.
  return (
    <Suspense fallback={null}>
      <PaymentRedirectClient />
    </Suspense>
  );
}
