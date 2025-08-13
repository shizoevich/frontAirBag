import React from "react";
import Wrapper from "@/layout/wrapper";
import Header from "@/layout/headers/header";
import Footer from "@/layout/footers/footer";
import CommonBreadcrumb from "@/components/breadcrumb/common-breadcrumb";
import CategoryProductsArea from "@/components/categories/category-products-area";
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params: { locale, slug } }) {
  const t = await getTranslations({ locale, namespace: 'Categories' });
  
  // Определяем заголовок страницы в зависимости от slug категории
  let title = '';
  
  if (slug === 'airbag-components') {
    title = t('airbag_components_seo_title');
  } else if (slug === 'pyrotechnics') {
    title = t('pyrotechnics_seo_title');
  } else {
    title = `AirBag - ${slug}`;
  }
  
  return {
    title,
  };
}

export default function CategorySlugPage({ params: { slug, locale } }) {
  // Преобразуем slug в более читаемый формат для отображения
  const formatSlug = (slug) => {
    return slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  // Определяем заголовок и подзаголовок для хлебных крошек
  let title = formatSlug(slug);
  let subtitle = formatSlug(slug);
  
  return (
    <Wrapper>
      <Header />
      <CommonBreadcrumb title={title} subtitle={subtitle} />
      <CategoryProductsArea categorySlug={slug} />
      <Footer primary_style={true} />
    </Wrapper>
  );
}
