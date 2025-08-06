import Wrapper from "@/layout/wrapper";
import Header from "@/layout/headers/header";
import Footer from "@/layout/footers/footer";
import CommonBreadcrumb from "@/components/breadcrumb/common-breadcrumb";
import CartArea from "@/components/cart-wishlist/cart-area";
import { useTranslations } from 'next-intl';

export const generateMetadata = async ({ params }) => {
  const { locale } = await params;
  return {
    title: `Shofy - ${locale === 'uk' ? 'Кошик' : locale === 'ru' ? 'Корзина' : 'Cart'} Page`,
  };
};

export default async function CartPage({ params }) {
  const { locale } = await params;
  
  return (
    <Wrapper>
      <Header />
      <CommonBreadcrumb 
        title={locale === 'uk' ? 'Кошик покупок' : locale === 'ru' ? 'Корзина покупок' : 'Shopping Cart'} 
        subtitle={locale === 'uk' ? 'Кошик покупок' : locale === 'ru' ? 'Корзина покупок' : 'Shopping Cart'} 
      />
      <CartArea />
      <Footer primary_style={true} />
    </Wrapper>
  );
}
