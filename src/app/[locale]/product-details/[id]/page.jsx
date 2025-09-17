import { notFound } from 'next/navigation';
import Wrapper from "@/layout/wrapper";
import Header from "@/layout/headers/header";
import Footer from "@/layout/footers/footer";
import ProductDetailsContent from "@/components/product-details/product-details-content";

export const revalidate = 600; // 10 минут ISR

async function fetchProduct(id) {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL;
  const res = await fetch(`${base}/goods/${id}/`, { next: { revalidate, tags: ['products', `product:${id}`] } });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error('Failed to fetch product');
  return res.json();
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  if (!id) return { title: 'AirBag - Product' };
  try {
    const product = await fetchProduct(id);
    if (!product) return { title: 'Product not found' };
    return {
      title: product.title || 'AirBag - Product',
      description: product.description?.slice(0, 160) || 'Product details',
      openGraph: {
        title: product.title,
        images: product.images || [],
      }
    };
  } catch {
    return { title: 'AirBag - Product' };
  }
}

export default async function ProductDetailsPage({ params }) {
  const { id } = await params;
  if (!id) notFound();

  const product = await fetchProduct(id);
  if (!product) notFound();

  const safeProduct = {
    ...product,
    id: product.id || id,
    category: product.category || { id: '0', name: 'Uncategorized' },
    title: product.title || 'No title',
    price_minor: product.price_minor ?? 0,
    images: product.images || [],
    description: product.description || '',
  };

  return (
    <Wrapper>
      <Header />
      <ProductDetailsContent productItem={safeProduct} />
      <Footer primary_style={true} />
    </Wrapper>
  );
}
