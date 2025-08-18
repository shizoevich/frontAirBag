import Wrapper from "@/layout/wrapper";
import Header from "@/layout/headers/header";
import Footer from "@/layout/footers/footer";
import CheckoutArea from "@/components/checkout/checkout-area";

export const metadata = {
  title: "AirBag - Checkout Page",
};

export default function CheckoutPage() {
  return (
    <Wrapper>
      <Header />
      <CheckoutArea/>
      <Footer style_2={true} />
    </Wrapper>
  );
}
