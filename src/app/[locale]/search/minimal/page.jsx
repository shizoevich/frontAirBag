import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params, searchParams }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'SearchPage' });
  
  return {
    title: t('title'),
  };
}

export default async function MinimalSearchPage({ params, searchParams }) {
  const { locale } = await params;
  const resolvedSearchParams = await searchParams;
  const t_page = await getTranslations({ locale, namespace: 'SearchPage' });

  // Extract URL parameters
  const searchText = resolvedSearchParams?.searchText || null;
  const categoryId = resolvedSearchParams?.categoryId || null;

  return (
    <div style={{ padding: '20px' }}>
      <h1>{t_page('searchProducts')}</h1>
      <p>Locale: {locale}</p>
      <p>Search Text: {searchText || 'None'}</p>
      <p>Category ID: {categoryId || 'None'}</p>
      
      <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc' }}>
        <h2>Minimal Search Page</h2>
        <p>This page tests basic next-intl functionality without complex components.</p>
        <p>If this works, the issue is in SearchArea or other components.</p>
      </div>
    </div>
  );
}
