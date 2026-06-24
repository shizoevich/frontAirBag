import { Suspense } from "react";
import Wrapper from "@/layout/wrapper";
import Header from "@/layout/headers/header";
import CtaArea from "@/components/cta/cta-area";
import FeatureArea from "@/components/features/feature-area";
import InstagramArea from "@/components/instagram/instagram-area";
import NewArrivals from "@/components/products/electronics/new-arrivals";
import ProductBanner from "@/components/products/electronics/product-banner";
import HomeProductsArea from "@/components/products/home-products-area";
import MobileSearch from "@/components/search/mobile-search";
import Footer from "@/layout/footers/footer";
import ProductItem from "@/components/products/electronics/product-item";
import CategoryCarousel from "@/components/categories/category-carousel";
import ParentCategories from "@/components/categories/parent-categories";
import YouTubeVideosSlider from "@/components/youtube/youtube-videos-slider";
import HomePrdLoader from "@/components/loader/home/home-prd-loader";

export const revalidate = 600; // ISR: обновлять раз в 10 минут

export default async function HomePage({ params }) {
  const locale = (await params)?.locale || 'uk';
  
  return (
    <Wrapper>
      <Header/>
      <FeatureArea locale={locale}/>
      <MobileSearch/>
      {/* Оставляем клиентский раздел для интерактива, фильтров и пагинации */}
      <Suspense fallback={<HomePrdLoader loading />}>
        <HomeProductsArea/>
      </Suspense>
      {/*<NewArrivals/>*/}
      <YouTubeVideosSlider key={`youtube-${Date.now()}`} />
      <CtaArea/>
      <Footer/>
    </Wrapper>
  )
}