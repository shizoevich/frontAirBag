import Wrapper from "@/layout/wrapper";
import HeaderTwo from "@/layout/headers/header-2";
import Footer from "@/layout/footers/footer";
import ShopBreadcrumb from "@/components/breadcrumb/shop-breadcrumb";
import ShopArea from "@/components/shop/shop-area";

export const metadata = {
  title: "Shofy - Shop Right Sidebar Page",
};

export default function ShopRightSidebarPage() {
  return (
    <Wrapper>
      <HeaderTwo style_2={true} />
      <ShopBreadcrumb title="Shop Grid" subtitle="Shop Grid" />
      <ShopArea shop_right={true}/>
      <Footer primary_style={true} />
    </Wrapper>
  );
}
