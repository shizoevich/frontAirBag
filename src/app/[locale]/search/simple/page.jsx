export default async function SimpleTestPage({ params, searchParams }) {
  const { locale } = await params;
  const resolvedSearchParams = await searchParams;

  return (
    <div>
      <h1>Simple Test Page</h1>
      <p>Locale: {locale}</p>
      <p>Search Text: {resolvedSearchParams?.searchText || 'None'}</p>
      <p>Category ID: {resolvedSearchParams?.categoryId || 'None'}</p>
      <p>This page works without next-intl!</p>
    </div>
  );
}
