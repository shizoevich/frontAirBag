import Wrapper from "@/layout/wrapper";
import Header from "@/layout/headers/header";
import SearchArea from "@/components/search/search-area";
import Footer from "@/layout/footers/footer";
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'SearchPage' });
  
  return {
    title: t('title'),
  };
}

export default async function SearchPage({ params }) {
  const { locale } = await params;
  const t_page = await getTranslations({ locale, namespace: 'SearchPage' });
  const t_search = await getTranslations({ locale, namespace: 'SearchArea' });

  // For static export, search parameters will be handled on the client side

  // Pre-translate all needed strings for client component
  // Для строк с переменными передаем шаблоны, а переменные будут подставляться в клиентском компоненте
  const translations = {
    error: t_search('error'),
    noProductsFound: t_search('noProductsFound'),
    noResults: t_search.raw('noResults'), // Передаем шаблон с переменными
    showingResults: t_search.raw('showingResults'), // Передаем шаблон с переменными
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
      />
      <Footer primary_style={true} />
    </Wrapper>
  );
}
