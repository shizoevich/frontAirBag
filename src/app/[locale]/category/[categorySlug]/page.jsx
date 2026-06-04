import { notFound } from 'next/navigation';
import Wrapper from "@/layout/wrapper";
import Header from "@/layout/headers/header";
import Footer from "@/layout/footers/footer";
import ShopCategoryArea from '@/components/categories/shop-category-area';
import { getTranslations } from 'next-intl/server';
import { buildAlternates } from '@/utils/seo';

// Helper function to fetch a single category by the id embedded at the end of the slug
// (slug format is `transliterated-title-<id>`, matching how category links are built).
async function fetchCategory(slug) {
  if (!slug || typeof slug !== 'string') return null;
  const id = slug.split('-').pop();
  if (!id || isNaN(parseInt(id, 10))) return null;

  const base = (process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/$/, '');
  const res = await fetch(`${base}/good-categories/${id}/`, { next: { revalidate: 600 } });
  if (!res.ok) return null;
  return res.json();
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
      `${category.title} — подушки безопасности, ремни и пиропатроны в AirbagAD. Доставка по Днепру и Украине.`,
    alternates: buildAlternates(`category/${params.categorySlug}`, params.locale),
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
