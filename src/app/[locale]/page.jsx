import { Suspense } from "react";
import Wrapper from "@/layout/wrapper";
import Header from "@/layout/headers/header";
import CtaArea from "@/components/cta/cta-area";
import FeatureArea from "@/components/features/feature-area";
import DeliveryCities from "@/components/features/delivery-cities";
import InstagramArea from "@/components/instagram/instagram-area";
import NewArrivals from "@/components/products/electronics/new-arrivals";
import ProductBanner from "@/components/products/electronics/product-banner";
import CatalogArea from "@/components/products/catalog-area";
import MobileSearch from "@/components/search/mobile-search";
import Footer from "@/layout/footers/footer";
import ProductItem from "@/components/products/electronics/product-item";
import CategoryCarousel from "@/components/categories/category-carousel";
import ParentCategories from "@/components/categories/parent-categories";
import YouTubeVideosSlider from "@/components/youtube/youtube-videos-slider";
import HomePrdLoader from "@/components/loader/home/home-prd-loader";
import { buildAlternates } from "@/utils/seo";

export const revalidate = 600; // ISR: обновлять раз в 10 минут

// Title and description come from the locale layout; this only pins the canonical URL
// and the hreflang set, which the home page was missing entirely.
export async function generateMetadata({ params }) {
  const { locale } = await params;
  return { alternates: buildAlternates('', locale) };
}

export default async function HomePage({ params }) {
  const locale = (await params)?.locale || 'uk';
  
  return (
    <Wrapper>
      <Header/>
      <FeatureArea locale={locale}/>
      <MobileSearch/>
      {/* Оставляем клиентский раздел для интерактива, фильтров и пагинации */}
      <Suspense fallback={<HomePrdLoader loading />}>
        <CatalogArea/>
      </Suspense>
      {/*<NewArrivals/>*/}
      <YouTubeVideosSlider key={`youtube-${Date.now()}`} />
      <DeliveryCities locale={locale}/>
      <CtaArea/>
      <Footer/>
    </Wrapper>
  )
}