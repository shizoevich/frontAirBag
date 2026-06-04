import { notFound } from 'next/navigation';
import Wrapper from "@/layout/wrapper";
import Header from "@/layout/headers/header";
import Footer from "@/layout/footers/footer";
import ProductDetailsContent from '@/components/product-details/product-details-content';
import { getTranslations } from 'next-intl/server';
import { SITE_URL, buildAlternates } from '@/utils/seo';
import { slugify } from '@/utils/slugify';

// Extract a usable image URL from a product's `images` field (JSON: array of urls or objects).
function firstImage(product) {
  const imgs = product?.images;
  if (!imgs) return null;
  const list = Array.isArray(imgs) ? imgs : [imgs];
  const first = list[0];
  if (!first) return null;
  return typeof first === 'string' ? first : first.url || first.src || null;
}

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

  const base = (process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/$/, '');
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

  const path = `product/${slugify(product.title)}-${product.id}`;
  const image = firstImage(product);
  const description =
    product.description ||
    `${product.title} — купить в AirbagAD. Подушки безопасности, ремни, пиропатроны с доставкой по Днепру и Украине.`;

  return {
    title: product.title || t('default_seo_title'),
    description,
    alternates: buildAlternates(path, params.locale),
    openGraph: {
      type: 'website',
      siteName: 'AirbagAD',
      title: `${product.title} | AirbagAD`,
      description,
      url: `${SITE_URL}/${params.locale}/${path}`,
      images: image ? [{ url: image, alt: product.title }] : undefined,
    },
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

  const path = `product/${slugify(product.title)}-${product.id}`;
  const image = firstImage(product);
  const price = product.price_minor != null ? (product.price_minor / 100).toFixed(2) : undefined;

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description || product.title,
    image: image || undefined,
    sku: product.code || String(product.id),
    brand: { '@type': 'Brand', name: 'AirbagAD' },
    offers: {
      '@type': 'Offer',
      url: `${SITE_URL}/${params.locale}/${path}`,
      priceCurrency: product.currency || 'UAH',
      price,
      availability:
        product.residue > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
    },
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Главная', item: `${SITE_URL}/${params.locale}` },
      { '@type': 'ListItem', position: 2, name: 'Магазин', item: `${SITE_URL}/${params.locale}/shop` },
      { '@type': 'ListItem', position: 3, name: product.title, item: `${SITE_URL}/${params.locale}/${path}` },
    ],
  };

  return (
    <Wrapper>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Header />
      <ProductDetailsContent productItem={product} />
      <Footer />
    </Wrapper>
  );
}
