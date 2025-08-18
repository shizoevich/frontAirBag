import Wrapper from "@/layout/wrapper";
import Header from "@/layout/headers/header";
import Footer from "@/layout/footers/footer";
import CategoryProductsArea from "@/components/categories/category-products-area";

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
      <CategoryProductsArea />
      <Footer primary_style={true} />
    </Wrapper>
  );
}
