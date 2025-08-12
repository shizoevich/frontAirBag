import Wrapper from "@/layout/wrapper";
import Header from "@/layout/headers/header";
import ProductDetailsArea from "@/components/product-details/product-details-area";
import Footer from "@/layout/footers/footer";

export const metadata = {
  title: "AirBag - Product Details Page",
};

export default async function ProductDetailsPage({ params }) {
  const { id } = await params;
  
  return (
    <Wrapper>
      <Header />
      <ProductDetailsArea id={id} />
      <Footer primary_style={true} />
    </Wrapper>
  );
}
