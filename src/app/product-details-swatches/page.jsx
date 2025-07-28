import Wrapper from "@/layout/wrapper";
import HeaderTwo from "@/layout/headers/header-2";
import ProductDetailsArea from "@/components/product-details/product-details-area";
import Footer from "@/layout/footers/footer";

export const metadata = {
  title: "Shofy - Product Details Swatches Page",
};

export default function ProductSwatchesDetailsPage() {
  return (
    <Wrapper>
      <HeaderTwo style_2={true} />
      <ProductDetailsArea id="641e887d05f9ee1717e1348a"/>
      <Footer primary_style={true} />
    </Wrapper>
  );
}
