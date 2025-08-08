import { getTranslations } from 'next-intl/server';
import Wrapper from "@/layout/wrapper";
import CommonBreadcrumb from "@/components/breadcrumb/common-breadcrumb";

export async function generateMetadata({ params, searchParams }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'SearchPage' });
  
  return {
    title: t('title'),
  };
}

export default async function StepByStepSearchPage({ params, searchParams }) {
  const { locale } = await params;
  const resolvedSearchParams = await searchParams;
  const t_page = await getTranslations({ locale, namespace: 'SearchPage' });

  // Extract URL parameters
  const searchText = resolvedSearchParams?.searchText || null;
  const categoryId = resolvedSearchParams?.categoryId || null;

  return (
    <Wrapper>
      <CommonBreadcrumb title={t_page('searchProducts')} subtitle={t_page('searchProducts')} />
      <div style={{ padding: '20px' }}>
        <h1>{t_page('searchProducts')}</h1>
        <p>Locale: {locale}</p>
        <p>Search Text: {searchText || 'None'}</p>
        <p>Category ID: {categoryId || 'None'}</p>
        
        <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc' }}>
          <h2>Step-by-Step Test</h2>
          <p>Testing with Wrapper + CommonBreadcrumb</p>
          <p>If this works, we'll add Header and Footer next.</p>
        </div>
      </div>
    </Wrapper>
  );
}
