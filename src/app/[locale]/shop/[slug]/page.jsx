import React from "react";
import Wrapper from "@/layout/wrapper";
import Header from "@/layout/headers/header";
import Footer from "@/layout/footers/footer";
import ProductItem from "@/components/products/electronics/product-item";
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';

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

export const revalidate = 600; // ISR 10 минут

async function fetchSubcategoryProducts(slug) {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL;
  // Пытаемся фильтровать по slug категории на сервере (Django lookup-style)
  const url = `${base}/goods/?category__slug=${encodeURIComponent(slug)}&limit=24&offset=0`;
  const res = await fetch(url, { next: { revalidate, tags: ['products', `shop:slug:${slug}`] } });
  if (!res.ok) return [];
  const data = await res.json();
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

export default async function ShopSubcategoryPage({ params }) {
  const { slug } = await params;
  if (!slug) notFound();
  const products = await fetchSubcategoryProducts(slug);

  return (
    <Wrapper>
      <Header />
      <section className="tp-product-area pb-90">
        <div className="container">
          <div className="row">
            {products.length === 0 && (
              <div className="col-12"><p>Товари тимчасово недоступні.</p></div>
            )}
            {products.map((item) => (
              <div className="col-xl-3 col-lg-4 col-md-6" key={item.id}>
                <ProductItem product={item} />
              </div>
            ))}
          </div>
        </div>
      </section>
      <Footer primary_style={true} />
    </Wrapper>
  );
}
