import Wrapper from "@/layout/wrapper";
import Header from "@/layout/headers/header";
import Footer from "@/layout/footers/footer";
import ShopBreadcrumb from "@/components/breadcrumb/shop-breadcrumb";
import PyrotechnicsArea from "@/components/categories/pyrotechnics-area";

export async function generateMetadata({ params: { locale } }) {
  const titles = {
    uk: "AirBag - Піропатрони",
    ru: "AirBag - Пиропатроны",
    en: "AirBag - Pyrotechnics"
  };
  
  return {
    title: titles[locale] || titles.uk,
  };
}

export default function PyrotechnicsPage() {
  return (
    <Wrapper>
      <Header />
      <ShopBreadcrumb title="pyrotechnics" subtitle="pyrotechnics" />
      <PyrotechnicsArea />
      <Footer primary_style={true} />
    </Wrapper>
  );
}
