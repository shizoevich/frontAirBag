import Wrapper from "@/layout/wrapper";
import Header from "@/layout/headers/header";
import Footer from "@/layout/footers/footer";
import AllProductsArea from "@/components/products/all-products-area";
import ProductItem from "@/components/products/electronics/product-item";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  return {
    title: `AirBag - ${locale === 'uk' ? 'Магазин' : locale === 'ru' ? 'Магазин' : 'Shop Page'}`,
  };
}

export default async function ShopPage({ params }) {
  const { locale } = await params;
  // Server-side fetch with ISR for initial SEO content
  const revalidate = 600;
  async function fetchProducts() {
    const base = process.env.NEXT_PUBLIC_API_BASE_URL;
    const res = await fetch(`${base}/goods/?limit=24&offset=0`, { next: { revalidate, tags: ['products', 'shop:list'] } });
    if (!res.ok) return [];
    const data = await res.json();
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.results)) return data.results;
    if (Array.isArray(data?.data)) return data.data;
    return [];
  }
  const products = await fetchProducts();
  return (
    <Wrapper>
      <Header />
      {/* SSR grid for SEO */}
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
      <AllProductsArea />
      <Footer primary_style={true} />
    </Wrapper>
  );
}
