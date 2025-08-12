import Wrapper from "@/layout/wrapper";
import Header from "@/layout/headers/header";
import Footer from "@/layout/footers/footer";
import ShopBreadcrumb from "@/components/breadcrumb/shop-breadcrumb";
import ShopArea from "@/components/shop/shop-area";

export const metadata = {
  title: "AirBag - Shop Page",
};

export default function ShopPage() {
  return (
    <Wrapper>
      <Header />
      <ShopBreadcrumb title="Shop Grid" subtitle="Shop Grid" />
      <ShopArea/>
      <Footer primary_style={true} />
    </Wrapper>
  );
}
