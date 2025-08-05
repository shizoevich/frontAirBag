import Wrapper from "@/layout/wrapper";
import Header from "@/layout/headers/header";
import Footer from "@/layout/footers/footer";
import ShopBreadcrumb from "@/components/breadcrumb/shop-breadcrumb";
import ShopArea from "@/components/shop/shop-area";

export const metadata = {
  title: "Shofy - Shop Hidden Sidebar Page",
};

export default function ShopHiddenSidebarPage() {
  return (
    <Wrapper>
      <Header />
      <ShopBreadcrumb title="Shop Grid" subtitle="Shop Grid" />
      <ShopArea hidden_sidebar={true}/>
      <Footer primary_style={true} />
    </Wrapper>
  );
}
