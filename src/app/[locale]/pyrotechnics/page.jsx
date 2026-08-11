import Wrapper from "@/layout/wrapper";
import Header from "@/layout/headers/header";
import Footer from "@/layout/footers/footer";
import PyrotechnicsArea from "@/components/categories/pyrotechnics-area";
import { buildAlternates } from "@/utils/seo";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const meta = {
    uk: {
      title: "Піропатрони та пульки",
      description: "Піропатрони, пульки та пірозаряди для подушок безпеки та ременів. Купівля та доставка по Дніпру та Україні — AirbagAD.",
    },
    ru: {
      title: "Пиропатроны и пульки",
      description: "Пиропатроны, пульки и пирозаряды для подушек безопасности и ремней. Покупка и доставка по всей Украине — AirbagAD.",
    },
    en: {
      title: "Pyrotechnics and squibs",
      description: "Pyrotechnics, squibs and charges for airbags and seat belts. Purchase and delivery across all Ukraine — AirbagAD.",
    },
  };
  const m = meta[locale] || meta.uk;
  return {
    title: m.title,
    description: m.description,
    alternates: buildAlternates('pyrotechnics', locale),
  };
}

export default function PyrotechnicsPage() {
  return (
    <Wrapper>
      <Header />
      <PyrotechnicsArea />
      <Footer primary_style={true} />
    </Wrapper>
  );
}
