import Wrapper from "@/layout/wrapper";
import Header from "@/layout/headers/header";
import BannerArea from "@/components/banner/banner-area";
import CtaArea from "@/components/cta/cta-area";
import FeatureArea from "@/components/features/feature-area";
import InstagramArea from "@/components/instagram/instagram-area";
import NewArrivals from "@/components/products/electronics/new-arrivals";
import ProductBanner from "@/components/products/electronics/product-banner";
import AllProductsArea from "@/components/products/all-products-area";
import Footer from "@/layout/footers/footer";


export default function HomePage() {
  return (
    <Wrapper>
      <Header/>
      <FeatureArea/>
      <AllProductsArea/>
      <BannerArea/>
      <NewArrivals/>
      <CtaArea/>
      <Footer/>
    </Wrapper>
  )
}
