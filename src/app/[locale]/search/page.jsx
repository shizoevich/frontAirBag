import Wrapper from "@/layout/wrapper";
import Header from "@/layout/headers/header";
import SearchArea from "@/components/search/search-area";
import Footer from "@/layout/footers/footer";
import { getTranslations } from 'next-intl/server';
import ProductItem from "@/components/products/electronics/product-item";

export const revalidate = 600; // ISR for search landing

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'SearchPage' });
  
  return {
    title: t('title'),
  };
}

export default async function SearchPage({ params, searchParams }) {
  const { locale } = await params;
  const t_page = await getTranslations({ locale, namespace: 'SearchPage' });
  const t_search = await getTranslations({ locale, namespace: 'SearchArea' });

  // Build server query from searchParams for initial SSR results
  const sp = await searchParams;
  const searchText = (sp?.searchText || '').toString();
  const categoryId = (sp?.categoryId || '').toString();
  const limit = 24;
  const qs = new URLSearchParams();
  qs.set('limit', String(limit));
  qs.set('offset', '0');
  if (searchText) qs.set('title__icontains', searchText);
  if (categoryId) {
    const parentCategoryIds = [754099, 754100, 754101];
    const numId = Number(categoryId);
    if (parentCategoryIds.includes(numId)) {
      qs.set('category__parent_id', String(numId));
    } else {
      // default: treat as id_remonline for subcategories
      qs.set('category__id_remonline', String(categoryId));
    }
  }

  async function fetchInitialResults() {
    const base = process.env.NEXT_PUBLIC_API_BASE_URL;
    const url = `${base}/goods/?${qs.toString()}`;
    const tags = ['products', 'search:list'];
    const res = await fetch(url, { next: { revalidate, tags } });
    if (!res.ok) return [];
    const data = await res.json();
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.results)) return data.results;
    if (Array.isArray(data?.data)) return data.data;
    return [];
  }
  const initialResults = await fetchInitialResults();

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
      {/* SSR initial results for SEO */}
      {(searchText || categoryId) && (
        <section className="tp-product-area pb-40">
          <div className="container">
            <div className="row">
              {initialResults.length === 0 && (
                <div className="col-12"><p>{t_search('noProductsFound')}</p></div>
              )}
              {initialResults.map((item) => (
                <div className="col-xl-3 col-lg-4 col-md-6" key={item.id}>
                  <ProductItem product={item} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
      <SearchArea 
        translations={translations}
      />
      <Footer primary_style={true} />
    </Wrapper>
  );
}
