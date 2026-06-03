import { Suspense } from 'react';
import Wrapper from '@/layout/wrapper';
import Header from '@/layout/headers/header';
import Footer from '@/layout/footers/footer';
import OrderSuccessContent from './OrderSuccessContent';

export default function OrderSuccessPage() {
  return (
    <Wrapper>
      <Header />
      <Suspense fallback={null}>
        <OrderSuccessContent />
      </Suspense>
      <Footer primary_style={true} />
    </Wrapper>
  );
}
