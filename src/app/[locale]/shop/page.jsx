import Wrapper from "@/layout/wrapper";
import Header from "@/layout/headers/header";
import Footer from "@/layout/footers/footer";
import AllProductsArea from "@/components/products/all-products-area";

export async function generateMetadata({ params: { locale } }) {
  return {
    title: `AirBag - ${locale === 'uk' ? 'Магазин' : locale === 'ru' ? 'Магазин' : 'Shop Page'}`,
  };
}

export default function ShopPage({ params }) {
  const { locale } = params;
  return (
    <Wrapper>
      <Header />
      <AllProductsArea />
      <Footer primary_style={true} />
    </Wrapper>
  );
}
