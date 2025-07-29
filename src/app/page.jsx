import Wrapper from "@/layout/wrapper";
import Header from "@/layout/headers/header";
import HomeHeroSlider from "@/components/hero-banner/home-hero-slider";
import BannerArea from "@/components/banner/banner-area";
import ElectronicCategory from "@/components/categories/electronic-category";
import CtaArea from "@/components/cta/cta-area";
import FeatureArea from "@/components/features/feature-area";
import InstagramArea from "@/components/instagram/instagram-area";
import NewArrivals from "@/components/products/electronics/new-arrivals";
import ProductArea from "@/components/products/electronics/product-area";
import ProductBanner from "@/components/products/electronics/product-banner";
import Footer from "@/layout/footers/footer";


export default function HomePage() {
  return (
    <Wrapper>
      <Header/>
      <HomeHeroSlider/>
      <ElectronicCategory/>
      <FeatureArea/>
      <ProductArea/>
      <BannerArea/>
      <ProductBanner/>
       <NewArrivals/>
      <InstagramArea/>
      <CtaArea/>
      <Footer/>
    </Wrapper>
  )
}
