import Wrapper from "@/layout/wrapper";
import Header from "@/layout/headers/header";
import Footer from "@/layout/footers/footer";
import AirbagComponentsArea from "@/components/categories/airbag-components-area";

export async function generateMetadata({ params: { locale } }) {
  const titles = {
    uk: "AirBag - Комплектуючі Airbag SRS",
    ru: "AirBag - Комплектующие Airbag SRS",
    en: "AirBag - Airbag SRS Components"
  };
  
  return {
    title: titles[locale] || titles.uk,
  };
}

export default function AirbagComponentsPage() {
  return (
    <Wrapper>
      <Header />
      <AirbagComponentsArea />
      <Footer primary_style={true} />
    </Wrapper>
  );
}
