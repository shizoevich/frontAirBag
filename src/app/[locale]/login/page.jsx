import Wrapper from "@/layout/wrapper";
import Header from "@/layout/headers/header";
import Footer from "@/layout/footers/footer";
import CommonBreadcrumb from "@/components/breadcrumb/common-breadcrumb";
import LoginArea from "@/components/login-register/login-area";
import { useTranslations } from 'next-intl';

export async function generateMetadata({ params: { locale } }) {
  return {
    title: `AirBag - ${locale === 'uk' ? 'Вхід' : locale === 'ru' ? 'Вход' : 'Login'} Page`,
  };
}

export default function LoginPage() {
  return (
    <Wrapper>
      <Header />
      <LoginArea/>
      <Footer primary_style={true} />
    </Wrapper>
  );
}
