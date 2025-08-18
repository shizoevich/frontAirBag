import Wrapper from "@/layout/wrapper";
import Header from "@/layout/headers/header";
import Footer from "@/layout/footers/footer";
import PrivacyPolicyArea from "@/components/privacy-policy/privacy-policy-area";
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params }) {
  const locale = params.locale;
  const t = await getTranslations({ locale, namespace: 'PrivacyPolicy' });
  
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  };
}

export default async function PrivacyPolicyPage({ params }) {
  const locale = params.locale;
  
  return (
    <Wrapper>
      <Header />
      <main className="main">
        <PrivacyPolicyArea />
      </main>
      <Footer primary_style={true} />
    </Wrapper>
  );
}
