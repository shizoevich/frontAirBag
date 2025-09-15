import Wrapper from "@/layout/wrapper";
import Header from "@/layout/headers/header";
import BrandSearchArea from "@/components/search/brand-search-area";
import Footer from "@/layout/footers/footer";
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'SearchPage' });
  
  return {
    title: t('brandTitle'),
  };
}

export default async function BrandSearchPage({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'SearchPage' });
  
  return (
    <Wrapper>
      <Header />
      <BrandSearchArea />
      <Footer primary_style={true} />
    </Wrapper>
  );
}
