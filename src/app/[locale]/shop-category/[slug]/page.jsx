import React from "react";
import Wrapper from "@/layout/wrapper";
import Header from "@/layout/headers/header";
import Footer from "@/layout/footers/footer";
import ProductItem from "@/components/products/electronics/product-item";
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';

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

// Generate static params for static export
export const revalidate = 600; // ISR 10 минут

const slugToIdMap = {
  'airbag-components': 754100,
  'pyrotechnics': 754101,
  'covers': 754099
};

async function fetchCategoryProducts(categoryId, slug) {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL;
  const url = `${base}/goods/?category_id=${categoryId}&limit=24&offset=0`;
  const res = await fetch(url, { next: { revalidate, tags: ['products', `category:slug:${slug}`] } });
  if (!res.ok) throw new Error('Failed to fetch products');
  const data = await res.json();
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

export default async function CategorySlugPage({ params: { slug, locale } }) {
  const categoryId = slugToIdMap[slug];
  if (!categoryId) notFound();

  const products = await fetchCategoryProducts(categoryId, slug);

  return (
    <Wrapper>
      <Header />
      <section className="tp-product-area pb-90">
        <div className="container">
          <div className="row">
            {products.length === 0 && (
              <div className="col-12"><p>Немає товарів у цій категорії.</p></div>
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
