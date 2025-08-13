import Wrapper from "@/layout/wrapper";
import Header from "@/layout/headers/header";
import Footer from "@/layout/footers/footer";
import ContactInfo from "@/components/contact/contact-info";
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params }) {
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: 'Contact' });
  return {
    title: t('title'),
  };
}

export default function ContactPage() {
  return (
    <Wrapper>
      <Header />
      <ContactInfo/>
      <Footer primary_style={true} />
    </Wrapper>
  );
}
