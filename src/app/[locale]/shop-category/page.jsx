import Wrapper from "@/layout/wrapper";
import Header from "@/layout/headers/header";
import Footer from "@/layout/footers/footer";
import ShopBreadcrumb from "@/components/breadcrumb/shop-breadcrumb";
import ShopCategoryArea from "@/components/categories/shop-category-area";

export async function generateMetadata({ params: { locale } }) {
  return {
    title: `Shofy - ${locale === 'uk' ? 'Категорії' : locale === 'ru' ? 'Категории' : 'Category Page'}`,
  };
}

export default function CategoryPage() {
  return (
    <Wrapper>
      <Header />
      <ShopBreadcrumb title="Only Categories" subtitle="Only Categories" />
      <ShopCategoryArea />
      <Footer primary_style={true} />
    </Wrapper>
  );
}
