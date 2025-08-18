import Wrapper from "@/layout/wrapper";
import Header from "@/layout/headers/header";
import Area from "@/components/search/search-area";
import Footer from "@/layout/footers/footer";
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params, searchParams }) {
  const { locale } = await params;
  const resolvedSearchParams = await searchParams;
  const t = await getTranslations({ locale, namespace: 'SearchPage' });
  
  return {
    title: t('title'),
  };
}

export default async function SearchPage({ params, searchParams }) {
  const { locale } = await params;
  const resolvedSearchParams = await searchParams;
  const t_page = await getTranslations({ locale, namespace: 'SearchPage' });
  const t_search = await getTranslations({ locale, namespace: 'SearchArea' });

  // Extract URL parameters for client component
  const searchText = resolvedSearchParams?.searchText || null;
  const categoryId = resolvedSearchParams?.categoryId || null;

  // Pre-translate all needed strings for client component
  const translations = {
    error: t_search('error'),
    noProductsFound: t_search('noProductsFound'),
    noResults: t_search('noResults'),
    showingResults: t_search('showingResults'),
    shortByPrice: t_search('shortByPrice'),
    priceLowToHigh: t_search('priceLowToHigh'),
    priceHighToLow: t_search('priceHighToLow'),
    breakLabel: t_search('breakLabel'),
    nextPage: t_search('nextPage'),
    previousPage: t_search('previousPage')
  };

  return (
    <Wrapper>
      <Header />
      <SearchArea 
        translations={translations}
        initialSearchText={searchText}
        initialCategoryId={categoryId}
      />
      <Footer primary_style={true} />
    </Wrapper>
  );
}
