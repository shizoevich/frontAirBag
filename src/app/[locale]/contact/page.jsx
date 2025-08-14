import Wrapper from "@/layout/wrapper";
import Header from "@/layout/headers/header";
import Footer from "@/layout/footers/footer";
import ContactInfo from "@/components/contact/contact-info";
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params }) {
  const { locale } = await params;
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

export default function ContactPage({ params }) {
  const { locale } = params;
  
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
