import React from "react";
import Wrapper from "@/layout/wrapper";
import Header from "@/layout/headers/header";
import Footer from "@/layout/footers/footer";
import CommonBreadcrumb from "@/components/breadcrumb/common-breadcrumb";
import ShopSubcategoryArea from "@/components/shop/shop-subcategory-area";
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params: { locale, slug } }) {
  const t = await getTranslations({ locale, namespace: 'Categories' });
  
  // Определяем заголовок страницы в зависимости от slug подкатегории
  let title = '';
  
  // Маппинг slug на ключи переводов
  const slugToTitleKey = {
    'connectors': 'connectors_seo_title',
    'mounts': 'mounts_seo_title',
    'resistors': 'resistors_seo_title',
    'airbags': 'airbags_seo_title',
    'belt-parts': 'belt_parts_seo_title'
  };
  
  if (slugToTitleKey[slug]) {
    try {
      title = t(slugToTitleKey[slug]);
    } catch (error) {
      // Если перевод не найден, используем форматированный slug
      title = `AirBag - ${slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}`;
    }
  } else {
    title = `AirBag - ${slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}`;
  }
  
  return {
    title,
  };
}

export default function ShopSubcategoryPage({ params: { slug } }) {
  // Преобразуем slug в более читаемый формат для отображения
  const formatSlug = (slug) => {
    return slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  // Определяем заголовок и подзаголовок для хлебных крошек
  const title = formatSlug(slug);
  const subtitle = formatSlug(slug);
  
  return (
    <Wrapper>
      <Header />
      <CommonBreadcrumb title={title} subtitle={subtitle} />
      <ShopSubcategoryArea subcategorySlug={slug} />
      <Footer primary_style={true} />
    </Wrapper>
  );
}
