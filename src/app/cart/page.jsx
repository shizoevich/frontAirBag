import Wrapper from "@/layout/wrapper";
import Header from "@/layout/headers/header";
import Footer from "@/layout/footers/footer";
import CartArea from "@/components/cart-components/cart-area";

export const metadata = {
  title: "AirBag - Cart Page",
};

export default function CartPage() {
  return (
    <Wrapper>
      <Header />
      <CartArea />
      <Footer primary_style={true} />
    </Wrapper>
  );
}
