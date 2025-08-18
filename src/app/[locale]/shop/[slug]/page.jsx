import React from "react";
import Wrapper from "@/layout/wrapper";
import Header from "@/layout/headers/header";
import Footer from "@/layout/footers/footer";
import ShopSubcategoryArea from "@/components/shop/shop-subcategory-area";
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params }) {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: 'Categories' });
  
  // Определяем заголовок страницы в зависимости от slug подкатегории
  let title = '';
  
  // Маппинг slug на ключи переводов
  const slugToTitleKey = {
    'connectors': 'connectors_seo_title',
    'mounts': 'mounts_seo_title',
    'resistors': 'resistors_seo_title',
    'airbags': 'airbags_seo_title',
    'belt-parts': 'belt_parts_seo_title',
    'pyro-belts': 'pyro_belts_seo_title',
    'pyro-seats': 'pyro_seats_seo_title',
    'pyro-curtains': 'pyro_curtains_seo_title',
    'pyro-steering': 'pyro_steering_seo_title',
    'pyro-dashboard': 'pyro_dashboard_seo_title',
    'covers': 'covers_seo_title'
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

export default async function ShopSubcategoryPage({ params }) {
  const { slug } = await params;
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
      <ShopSubcategoryArea subcategorySlug={slug} />
      <Footer primary_style={true} />
    </Wrapper>
  );
}
