import { notFound } from 'next/navigation';
import Wrapper from "@/layout/wrapper";
import Header from "@/layout/headers/header";
import Footer from "@/layout/footers/footer";
import ShopCategoryArea from '@/components/categories/shop-category-area';
import { getTranslations } from 'next-intl/server';

// Helper function to fetch a single category by slug
async function fetchCategory(slug) {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL;
  const res = await fetch(`${base}/good-categories/?slug=${slug}`, { next: { revalidate: 600 } });
  if (!res.ok) return null;
  const data = await res.json();
  // The API returns a list, so we take the first item
  return data.results?.[0] || data.data?.[0] || data?.[0];
}

// Generate metadata for the page
export async function generateMetadata({ params: awaitedParams }) {
  const params = await awaitedParams;
  const t = await getTranslations({ locale: params.locale, namespace: 'Categories' });
  const category = await fetchCategory(params.categorySlug);
  if (!category) {
    return { title: 'Category Not Found' };
  }
  return {
    title: category.title || t('default_seo_title'),
    description: category.description || `Products in the ${category.title} category`,
  };
}

// The main page component
export default async function ShopCategoryPage({ params: awaitedParams }) {
  const params = await awaitedParams;
  const category = await fetchCategory(params.categorySlug);

  if (!category) {
    notFound();
  }

  return (
    <Wrapper>
      <Header />
      <ShopCategoryArea category={category} />
      <Footer />
    </Wrapper>
  );
}
