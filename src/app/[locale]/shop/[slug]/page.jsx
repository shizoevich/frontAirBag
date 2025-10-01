import React from 'react';
import Wrapper from '@/layout/wrapper';
import Header from '@/layout/headers/header';
import Footer from '@/layout/footers/footer';
import CategoryProductsArea from '@/components/products/category-products-area';
import { getTranslations } from 'next-intl/server';

// Helper function to fetch a single category by its slug
async function fetchCategory(slug) {
  if (!slug) return null;
  const base = process.env.NEXT_PUBLIC_API_BASE_URL;
  const res = await fetch(`${base}/good-categories/?slug=${slug}`, { next: { revalidate: 600 } });
  if (!res.ok) return null;
  const data = await res.json();
  return data.results?.[0] || data.data?.[0] || data?.[0];
}

// Generate metadata for the page
export async function generateMetadata({ params }) {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: 'Categories' });
  const category = await fetchCategory(slug);

  return {
    title: category?.title || t('default_shop_title'),
    description: category?.description || `Products in the ${category?.title || 'shop'}`,
  };
}

// The main page component shows only products for the selected category
export default function ShopSubcategoryPage() {
  return (
    <Wrapper>
      <Header />
      <CategoryProductsArea />
      <Footer primary_style={true} />
    </Wrapper>
  );
}
