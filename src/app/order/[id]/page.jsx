import Wrapper from "@/layout/wrapper";
import Header from "@/layout/headers/header";
import Footer from "@/layout/footers/footer";
import OrderArea from "@/components/order/order-area";

export const metadata = {
  title: "Shofy - Order Page",
};

export default function OrderPage({ params }) {
  return (
    <Wrapper>
      <Header />
      <OrderArea orderId={params.id} />
      <Footer primary_style={true} />
    </Wrapper>
  );
}
