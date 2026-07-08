import Wrapper from "@/layout/wrapper";
import Header from "@/layout/headers/header";
import Footer from "@/layout/footers/footer";
import CarBrandsArea from "@/components/categories/car-brands-area";
import { buildAlternates } from "@/utils/seo";

export async function generateMetadata({ params: { locale } }) {
  const meta = {
    uk: {
      title: "Підбір за маркою авто",
      description: "Подушки безпеки, ремені та піропатрони за маркою автомобіля — Jeep, Ford, Audi та інші. Доставка по Дніпру та Україні — AirbagAD.",
    },
    ru: {
      title: "Подбор по марке авто",
      description: "Подушки безопасности, ремни и пиропатроны по марке автомобиля — Jeep, Ford, Audi и другие. Доставка по Днепру и Украине — AirbagAD.",
    },
    en: {
      title: "Search by car brand",
      description: "Airbags, seat belts and pyrotechnics by car brand — Jeep, Ford, Audi and more. Delivery across Dnipro and Ukraine — AirbagAD.",
    },
  };
  const m = meta[locale] || meta.uk;
  return {
    title: m.title,
    description: m.description,
    alternates: buildAlternates('car-brands', locale),
  };
}

export default function CarBrandsPage() {
  return (
    <Wrapper>
      <Header />
      <CarBrandsArea />
      <Footer primary_style={true} />
    </Wrapper>
  );
}
