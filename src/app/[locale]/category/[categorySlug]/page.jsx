import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import Wrapper from "@/layout/wrapper";
import Header from "@/layout/headers/header";
import Footer from "@/layout/footers/footer";
import CatalogArea from '@/components/products/catalog-area';
import HomePrdLoader from '@/components/loader/home/home-prd-loader';
import MobileSearch from '@/components/search/mobile-search';
import { getTranslations } from 'next-intl/server';
import { buildAlternates, getServerApiBase } from '@/utils/seo';
import { categoryIdFromSlug } from '@/utils/category-link';

export const revalidate = 600; // ISR, как на главной

// Helper function to fetch a single category by the id embedded at the end of the slug
// (slug format is `transliterated-title-<id>`, matching how category links are built).
async function fetchCategory(slug) {
  const id = categoryIdFromSlug(slug);
  if (!id) return null;

  const base = getServerApiBase();
  try {
    const res = await fetch(`${base}/good-categories/${id}/`, { next: { revalidate: 600 } });
    if (!res.ok) return null;
    return res.json();
  } catch (e) {
    console.error('fetchCategory failed:', e?.message || e);
    return null;
  }
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
    title: category.meta_title || category.title || t('default_seo_title'),
    description:
      category.meta_description ||
      category.description ||
      `${category.title} — подушки безопасности, ремни и пиропатроны в AirbagAD. Доставка по всей Украине.`,
    alternates: buildAlternates(`category/${params.categorySlug}`, params.locale),
  };
}

// Same catalog as the home page, with this category preselected: the category rows,
// filters and pagination must behave identically no matter how the user got here.
export default async function ShopCategoryPage({ params: awaitedParams }) {
  const params = await awaitedParams;
  const category = await fetchCategory(params.categorySlug);

  if (!category) {
    notFound();
  }

  return (
    <Wrapper>
      <Header />
      <MobileSearch />
      <Suspense fallback={<HomePrdLoader loading />}>
        <CatalogArea activeCategoryId={category.id} />
      </Suspense>
      <Footer />
    </Wrapper>
  );
}
