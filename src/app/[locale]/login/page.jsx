import Wrapper from "@/layout/wrapper";
import Header from "@/layout/headers/header";
import Footer from "@/layout/footers/footer";
import CommonBreadcrumb from "@/components/breadcrumb/common-breadcrumb";
import LoginArea from "@/components/login-register/login-area";
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params }) {
  // Получаем локаль асинхронно
  const locale = params.locale;
  
  // Получаем переводы для заголовка
  let title = 'Login';
  
  if (locale === 'uk') {
    title = 'Вхід';
  } else if (locale === 'ru') {
    title = 'Вход';
  }
  
  return {
    title: `AirBag - ${title} Page`,
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
