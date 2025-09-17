import Wrapper from "@/layout/wrapper";
import Header from "@/layout/headers/header";
import Footer from "@/layout/footers/footer";
import AllProductsArea from "@/components/products/all-products-area";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  return {
    title: `AirBag - ${locale === 'uk' ? 'Магазин' : locale === 'ru' ? 'Магазин' : 'Shop Page'}`,
  };
}

export default async function ShopPage({ params }) {
  const { locale } = await params;
  return (
    <Wrapper>
      <Header />
      <AllProductsArea />
      <Footer primary_style={true} />
    </Wrapper>
  );
}
