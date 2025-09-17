import Wrapper from "@/layout/wrapper";
import Header from "@/layout/headers/header";
import Footer from "@/layout/footers/footer";
import ShopArea from "@/components/shop/shop-area";

export async function generateMetadata({ params: { locale } }) {
  return {
    title: `AirBag - ${locale === 'uk' ? 'Магазин з правою боковою панеллю' : locale === 'ru' ? 'Магазин с правой боковой панелью' : 'Shop Right Sidebar Page'}`,
  };
}

export default function ShopRightSidebarPage() {
  return (
    <Wrapper>
      <Header />
      <ShopBreadcrumb/>
      <ShopArea shop_right={true}/>
      <Footer primary_style={true} />
    </Wrapper>
  );
}
