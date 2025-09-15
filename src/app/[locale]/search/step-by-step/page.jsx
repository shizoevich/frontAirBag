import { getTranslations } from 'next-intl/server';
import Wrapper from "@/layout/wrapper";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'SearchPage' });
  
  return {
    title: t('title'),
  };
}

export default async function StepByStepSearchPage({ params }) {
  const { locale } = await params;
  const t_page = await getTranslations({ locale, namespace: 'SearchPage' });

  // For static export, search parameters will be handled on the client side

  return (
    <Wrapper>
      <div style={{ padding: '20px' }}>
        <h1>{t_page('searchProducts')}</h1>
        <p>Locale: {locale}</p>
        <p>Search parameters will be handled on the client side for static export</p>
        
        <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc' }}>
          <h2>Step-by-Step Test</h2>
          <p>Testing with Wrapper + CommonBreadcrumb</p>
          <p>If this works, we&apos;ll add Header and Footer next.</p>
        </div>
      </div>
    </Wrapper>
  );
}
