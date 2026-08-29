import CatalogPageView from "@/components/catalog/catalog-page-view";
import { setRequestLocale } from "next-intl/server";
import { buildAlternates } from "@/utils/seo";

export const revalidate = 600; // ISR: обновлять раз в 10 минут

// Title and description come from the locale layout; this only pins the canonical URL
// and the hreflang set, which the home page was missing entirely.
export async function generateMetadata({ params }) {
  const { locale } = await params;
  return { alternates: buildAlternates('', locale) };
}

export default async function HomePage({ params }) {
  const locale = (await params)?.locale || 'uk';
  setRequestLocale(locale);

  return <CatalogPageView locale={locale} />;
}
