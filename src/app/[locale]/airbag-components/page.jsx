import Wrapper from "@/layout/wrapper";
import Header from "@/layout/headers/header";
import Footer from "@/layout/footers/footer";
import AirbagComponentsArea from "@/components/categories/airbag-components-area";
import { buildAlternates } from "@/utils/seo";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const meta = {
    uk: {
      title: "Комплектуючі Airbag SRS",
      description: "Комплектуючі системи Airbag SRS: подушки безпеки, піропатрони, датчики. Продаж і доставка по Дніпру та Україні — AirbagAD.",
    },
    ru: {
      title: "Комплектующие Airbag SRS",
      description: "Комплектующие системы Airbag SRS: подушки безопасности, пиропатроны, датчики. Продажа и доставка по всей Украине — AirbagAD.",
    },
    en: {
      title: "Airbag SRS components",
      description: "Airbag SRS system components: airbags, pyrotechnics, sensors. Sale and delivery across all Ukraine — AirbagAD.",
    },
  };
  const m = meta[locale] || meta.uk;
  return {
    title: m.title,
    description: m.description,
    alternates: buildAlternates('airbag-components', locale),
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
