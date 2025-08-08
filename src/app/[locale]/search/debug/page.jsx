import { getTranslations } from 'next-intl/server';

export default async function DebugSearchPage({ params, searchParams }) {
  try {
    const { locale } = await params;
    const resolvedSearchParams = await searchParams;
    
    console.log('Debug: locale =', locale);
    console.log('Debug: searchParams =', resolvedSearchParams);
    
    // Try to get translations with error handling
    let t_page;
    try {
      t_page = await getTranslations({ locale, namespace: 'SearchPage' });
      console.log('Debug: SearchPage translations loaded successfully');
    } catch (error) {
      console.error('Debug: Error loading SearchPage translations:', error);
      return (
        <div>
          <h1>Debug Page - Translation Error</h1>
          <p>Locale: {locale}</p>
          <p>Error loading SearchPage translations: {error.message}</p>
        </div>
      );
    }

    return (
      <div>
        <h1>Debug Page - Success</h1>
        <p>Locale: {locale}</p>
        <p>Search Text: {resolvedSearchParams?.searchText || 'None'}</p>
        <p>Category ID: {resolvedSearchParams?.categoryId || 'None'}</p>
        <p>Translation test: {t_page('searchProducts')}</p>
        <p>next-intl is working!</p>
      </div>
    );
  } catch (error) {
    console.error('Debug: General error:', error);
    return (
      <div>
        <h1>Debug Page - General Error</h1>
        <p>Error: {error.message}</p>
        <p>Stack: {error.stack}</p>
      </div>
    );
  }
}
