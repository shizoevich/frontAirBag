import CatalogPageView from '@/components/catalog/catalog-page-view';
import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'SearchPage' });
  return {
    title: t('title') || 'Search - AirBag',
  };
}

/**
 * Поиск — это витрина с заполненным запросом, а не отдельная страница.
 *
 * Раньше здесь был свой вид: только сетка товаров, без баннера и без уровней
 * категорий. Введённый запрос убирал со страницы всю навигацию, и сузить выдачу
 * было нечем. Теперь рендерим тот же `CatalogPageView`, что главная и страница
 * категории; запрос `CatalogArea` берёт из `?searchText=`.
 */
export default async function SearchPage({ params }) {
  const locale = (await params)?.locale || 'uk';
  setRequestLocale(locale);

  return <CatalogPageView locale={locale} />;
}
