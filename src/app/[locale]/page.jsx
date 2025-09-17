import Wrapper from "@/layout/wrapper";
import Header from "@/layout/headers/header";
import CtaArea from "@/components/cta/cta-area";
import FeatureArea from "@/components/features/feature-area";
import InstagramArea from "@/components/instagram/instagram-area";
import NewArrivals from "@/components/products/electronics/new-arrivals";
import ProductBanner from "@/components/products/electronics/product-banner";
import AllProductsArea from "@/components/products/all-products-area";
import MobileSearch from "@/components/search/mobile-search";
import Footer from "@/layout/footers/footer";
import ProductItem from "@/components/products/electronics/product-item";
import CategoryCarousel from "@/components/categories/category-carousel";
import ParentCategories from "@/components/categories/parent-categories";

export const revalidate = 600; // ISR: обновлять раз в 10 минут

async function fetchHomeProducts() {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL;
  const res = await fetch(`${base}/goods/?limit=24&offset=0`, { next: { revalidate, tags: ['products', 'home:list'] } });
  if (!res.ok) return [];
  const data = await res.json();
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

async function fetchCategories() {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL;
  const res = await fetch(`${base}/good-categories/`, { next: { revalidate, tags: ['categories', 'home:categories'] } });
  if (!res.ok) return { parents: [], children: [] };
  const raw = await res.json();
  const categories = Array.isArray(raw?.data) ? raw.data : Array.isArray(raw) ? raw : [];
  const parents = categories.filter(cat => !cat.parent_id);
  const children = categories.filter(cat => !!cat.parent_id);
  return { parents, children };
}

export default async function HomePage({ params }) {
  const locale = (await params)?.locale || 'uk';
  const [products, { parents, children }] = await Promise.all([
    fetchHomeProducts(),
    fetchCategories(),
  ]);
  return (
    <Wrapper>
      <Header/>
      <FeatureArea/>
      <MobileSearch/>
    
  
      {/* Оставляем клиентский раздел для интерактива, фильтров и пагинации */}
      <AllProductsArea/>
      {/*<NewArrivals/>*/}
      <CtaArea/>
      <Footer/>
    </Wrapper>
  )
}
