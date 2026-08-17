import { Suspense } from "react";
import Wrapper from "@/layout/wrapper";
import Header from "@/layout/headers/header";
import Footer from "@/layout/footers/footer";
import ResetPasswordArea from "@/components/login-register/reset-password-area";
import { NOINDEX } from '@/utils/seo';

export async function generateMetadata({ params }) {
  const { locale } = await params;

  let title = 'New password';
  if (locale === 'uk') {
    title = 'Новий пароль';
  } else if (locale === 'ru') {
    title = 'Новый пароль';
  }

  return {
    title: `AirBag - ${title}`,
    robots: NOINDEX,
  };
}

export default function ResetPasswordPage() {
  return (
    <Wrapper>
      <Header />
      {/* ResetPasswordArea читает uid/token через useSearchParams — без Suspense
          сборка падает на пререндере. */}
      <Suspense fallback={null}>
        <ResetPasswordArea />
      </Suspense>
      <Footer primary_style={true} />
    </Wrapper>
  );
}
