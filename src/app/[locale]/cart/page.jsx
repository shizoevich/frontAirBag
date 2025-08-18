import Wrapper from "@/layout/wrapper";
import Header from "@/layout/headers/header";
import Footer from "@/layout/footers/footer";
import CartArea from "@/components/cart-components/cart-area";
import { useTranslations } from 'next-intl';

export const generateMetadata = async ({ params }) => {
  const { locale } = await params;
  return {
    title: `AirBag - ${locale === 'uk' ? 'Кошик' : locale === 'ru' ? 'Корзина' : 'Cart'} Page`,
  };
};

export default async function CartPage({ params }) {
  const { locale } = await params;
  
  return (
    <Wrapper>
      <Header />
      <CartArea />
      <Footer primary_style={true} />
    </Wrapper>
  );
}
