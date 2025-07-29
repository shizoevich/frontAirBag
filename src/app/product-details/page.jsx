import Wrapper from "@/layout/wrapper";
import HeaderTwo from "@/layout/headers/header-2";
import ProductDetailsArea from "@/components/product-details/product-details-area";
import Footer from "@/layout/footers/footer";

export const metadata = {
  title: "Shofy - Product Details Page",
};

export default function ProductDetailsPage({ params }) {
  return (
    <Wrapper>
      <HeaderTwo style_2={true} />
      <ProductDetailsArea id={params.id} />
      <Footer primary_style={true} />
    </Wrapper>
  );
}
