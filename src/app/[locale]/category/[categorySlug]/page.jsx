import { notFound } from 'next/navigation';
import CatalogPageView from '@/components/catalog/catalog-page-view';
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

// Ровно тот же вид, что и главная (баннер, поиск, каталог, видео, города, CTA) —
// отличается только предвыбранной категорией и метаданными.
export default async function ShopCategoryPage({ params: awaitedParams }) {
  const params = await awaitedParams;
  const category = await fetchCategory(params.categorySlug);

  if (!category) {
    notFound();
  }

  return <CatalogPageView locale={params.locale} activeCategoryId={category.id} />;
}
