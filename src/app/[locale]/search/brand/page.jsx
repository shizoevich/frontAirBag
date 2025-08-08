import Wrapper from "@/layout/wrapper";
import Header from "@/layout/headers/header";
import CommonBreadcrumb from "@/components/breadcrumb/common-breadcrumb";
import BrandSearchArea from "@/components/search/brand-search-area";
import Footer from "@/layout/footers/footer";
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params: { locale } }) {
  const t = await getTranslations({ locale, namespace: 'SearchPage' });
  
  return {
    title: t('brandTitle'),
  };
}

export default async function BrandSearchPage({ params: { locale } }) {
  const t = await getTranslations({ locale, namespace: 'SearchPage' });
  
  return (
    <Wrapper>
      <Header />
      <CommonBreadcrumb title={t('brandProducts')} subtitle={t('brandProducts')} />
      <BrandSearchArea />
      <Footer primary_style={true} />
    </Wrapper>
  );
}
