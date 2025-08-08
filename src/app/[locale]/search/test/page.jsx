import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params, searchParams }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'SearchPage' });
  
  return {
    title: t('title'),
  };
}

export default async function TestSearchPage({ params, searchParams }) {
  const { locale } = await params;
  const resolvedSearchParams = await searchParams;
  const t_page = await getTranslations({ locale, namespace: 'SearchPage' });

  // Extract URL parameters
  const searchText = resolvedSearchParams?.searchText || null;
  const categoryId = resolvedSearchParams?.categoryId || null;

  return (
    <div>
      <h1>{t_page('searchProducts')}</h1>
      <p>Locale: {locale}</p>
      <p>Search Text: {searchText || 'None'}</p>
      <p>Category ID: {categoryId || 'None'}</p>
      <p>Test page working!</p>
    </div>
  );
}
