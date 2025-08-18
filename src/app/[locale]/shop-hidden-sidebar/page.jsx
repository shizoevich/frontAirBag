import Wrapper from "@/layout/wrapper";
import Header from "@/layout/headers/header";
import Footer from "@/layout/footers/footer";
import ShopBreadcrumb from "@/components/breadcrumb/shop-breadcrumb";
import ShopArea from "@/components/shop/shop-area";

export async function generateMetadata({ params: { locale } }) {
  return {
    title: `AirBag - ${locale === 'uk' ? 'Магазин з прихованою боковою панеллю' : locale === 'ru' ? 'Магазин со скрытой боковой панелью' : 'Shop Hidden Sidebar Page'}`,
  };
}

export default function ShopHiddenSidebarPage() {
  return (
    <Wrapper>
      <Header />
      <ShopBreadcrumb/>
      <ShopArea hidden_sidebar={true}/>
      <Footer primary_style={true} />
    </Wrapper>
  );
}
