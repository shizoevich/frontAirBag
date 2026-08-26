import Wrapper from "@/layout/wrapper";
import Header from "@/layout/headers/header";
import Footer from "@/layout/footers/footer";
import ClaimAccountArea from "@/components/login-register/claim-account-area";
import { NOINDEX } from '@/utils/seo';

export async function generateMetadata({ params }) {
  const { locale } = await params;

  let title = 'Restore access';
  if (locale === 'uk') {
    title = 'Відновлення доступу';
  } else if (locale === 'ru') {
    title = 'Восстановление доступа';
  }

  return {
    title: `AirBag - ${title}`,
    // Страница персональная и содержит код в адресе — в индексе ей не место.
    robots: NOINDEX,
  };
}

export default async function ClaimAccountPage({ params }) {
  const { code } = await params;

  return (
    <Wrapper>
      <Header />
      <ClaimAccountArea code={code} />
      <Footer primary_style={true} />
    </Wrapper>
  );
}
