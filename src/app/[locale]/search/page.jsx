import React from 'react';
import Wrapper from '@/layout/wrapper';
import Header from '@/layout/headers/header';
import Footer from '@/layout/footers/footer';
import SearchProductsArea from '@/components/products/search-products-area';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'SearchPage' });
  return {
    title: t('title') || 'Search - AirBag',
  };
}

// The search page shows only products without category filters
export default function SearchPage() {
  return (
    <Wrapper>
      <Header />
      <SearchProductsArea />
      <Footer primary_style={true} />
    </Wrapper>
  );
}
