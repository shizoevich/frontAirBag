import Wrapper from "@/layout/wrapper";
import Header from "@/layout/headers/header";
import Footer from "@/layout/footers/footer";
import ForgotArea from "@/components/login-register/forgot-area";
import { NOINDEX } from '@/utils/seo';

export async function generateMetadata({ params }) {
  const { locale } = await params;

  let title = 'Reset password';
  if (locale === 'uk') {
    title = 'Відновлення пароля';
  } else if (locale === 'ru') {
    title = 'Восстановление пароля';
  }

  return {
    title: `AirBag - ${title}`,
    robots: NOINDEX,
  };
}

export default function ForgotPage() {
  return (
    <Wrapper>
      <Header />
      <ForgotArea />
      <Footer primary_style={true} />
    </Wrapper>
  );
}
