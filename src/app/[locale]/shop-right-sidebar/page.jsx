import Wrapper from "@/layout/wrapper";
import Header from "@/layout/headers/header";
import Footer from "@/layout/footers/footer";
import ShopBreadcrumb from "@/components/breadcrumb/shop-breadcrumb";
import ShopArea from "@/components/shop/shop-area";

export async function generateMetadata({ params: { locale } }) {
  return {
    title: `Shofy - ${locale === 'uk' ? 'Магазин з правою боковою панеллю' : locale === 'ru' ? 'Магазин с правой боковой панелью' : 'Shop Right Sidebar Page'}`,
  };
}

export default function ShopRightSidebarPage() {
  return (
    <Wrapper>
      <Header />
      <ShopBreadcrumb title="Shop Grid" subtitle="Shop Grid" />
      <ShopArea shop_right={true}/>
      <Footer primary_style={true} />
    </Wrapper>
  );
}
