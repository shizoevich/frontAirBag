import { notFound } from 'next/navigation';
import Wrapper from "@/layout/wrapper";
import Header from "@/layout/headers/header";
import Footer from "@/layout/footers/footer";
import ProductDetailsContent from '@/components/product-details/product-details-content';
import { getTranslations } from 'next-intl/server';

// Helper function to fetch a single product by its ID, extracted from the slug
async function fetchProduct(slug) {
  // A slug is expected, e.g., "my-product-title-123"
  if (!slug || typeof slug !== 'string') {
    console.error('Invalid slug provided to fetchProduct:', slug);
    return null;
  }
  
  // Extract the ID from the end of the slug
  const id = slug.split('-').pop();
  if (!id || isNaN(parseInt(id, 10))) {
    console.error('Could not extract a valid ID from slug:', slug);
    return null;
  }

  const base = process.env.NEXT_PUBLIC_API_BASE_URL;
  const res = await fetch(`${base}/goods/${id}/`, { next: { revalidate: 600 } });

  if (!res.ok) {
    // This will be caught by notFound() in the page component
    return null;
  }
  
  return res.json();
}

// Generate metadata for the page
export async function generateMetadata({ params: awaitedParams }) {
  const params = await awaitedParams;
  // Ensure params and params.slug exist before using them
  if (!params || !params.slug) {
    return { title: 'Product Not Found' };
  }

  const t = await getTranslations({ locale: params.locale, namespace: 'Products' });
  const product = await fetchProduct(params.slug);

  if (!product) {
    return { title: 'Product Not Found' };
  }

  return {
    title: product.title || t('default_seo_title'),
    description: product.description || `Details for ${product.title}`,
  };
}

// The main page component
export default async function ProductDetailsPage({ params: awaitedParams }) {
  const params = await awaitedParams;
  // Ensure params and params.slug exist before using them
  if (!params || !params.slug) {
    notFound();
  }
  
  const product = await fetchProduct(params.slug);

  if (!product) {
    notFound();
  }

  return (
    <Wrapper>
      <Header />
      <ProductDetailsContent productItem={product} />
      <Footer />
    </Wrapper>
  );
}
