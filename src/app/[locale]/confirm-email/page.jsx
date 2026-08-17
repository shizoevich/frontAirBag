import { Suspense } from "react";
import Wrapper from "@/layout/wrapper";
import Header from "@/layout/headers/header";
import Footer from "@/layout/footers/footer";
import ConfirmEmailArea from "@/components/login-register/confirm-email-area";
import { NOINDEX } from '@/utils/seo';

export async function generateMetadata({ params }) {
  const { locale } = await params;

  let title = 'Confirm email';
  if (locale === 'uk') {
    title = 'Підтвердження пошти';
  } else if (locale === 'ru') {
    title = 'Подтверждение почты';
  }

  return {
    title: `AirBag - ${title}`,
    robots: NOINDEX,
  };
}

export default function ConfirmEmailPage() {
  return (
    <Wrapper>
      <Header />
      {/* ConfirmEmailArea читает token/email через useSearchParams — без Suspense
          сборка падает на пререндере. */}
      <Suspense fallback={null}>
        <ConfirmEmailArea />
      </Suspense>
      <Footer primary_style={true} />
    </Wrapper>
  );
}
