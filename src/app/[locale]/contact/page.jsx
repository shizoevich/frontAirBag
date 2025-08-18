import Wrapper from "@/layout/wrapper";
import Header from "@/layout/headers/header";
import Footer from "@/layout/footers/footer";
import ContactInfo from "@/components/contact/contact-info";
import ContactArea from "@/components/contact/contact-area";
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params }) {
  const locale = params.locale;
  const t = await getTranslations({ locale, namespace: 'Contact' });
  
  return {
    title: t('pageTitle'),
    description: t('pageDescription'),
    openGraph: {
      title: t('pageTitle'),
      description: t('pageDescription'),
      type: 'website',
      locale: locale,
      siteName: 'AirBag',
    }
  };
}

export default async function ContactPage({ params }) {
  const locale = params.locale;
  
  return (
    <Wrapper>
      <Header />
      <main className="main">
        <ContactInfo locale={locale} />
      </main>
      <Footer primary_style={true} />
    </Wrapper>
  );
}
