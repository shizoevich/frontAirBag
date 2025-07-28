import Wrapper from "@/layout/wrapper";
import HeaderTwo from "@/layout/headers/header-2";
import Footer from "@/layout/footers/footer";
import CommonBreadcrumb from "@/components/breadcrumb/common-breadcrumb";
import CartArea from "@/components/cart-wishlist/cart-area";

export const metadata = {
  title: "Shofy - Cart Page",
};

export default function CartPage() {
  return (
    <Wrapper>
      <HeaderTwo style_2={true} />
      <CommonBreadcrumb title="Shopping Cart" subtitle="Shopping Cart" />
      <CartArea />
      <Footer primary_style={true} />
    </Wrapper>
  );
}
