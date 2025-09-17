import Wrapper from "@/layout/wrapper";
import Header from "@/layout/headers/header";
import Footer from "@/layout/footers/footer";
import CarBrandsArea from "@/components/categories/car-brands-area";

export async function generateMetadata({ params: { locale } }) {
  const titles = {
    uk: "AirBag - Марки автомобілів",
    ru: "AirBag - Марки автомобилей",
    en: "AirBag - Car Brands"
  };
  
  return {
    title: titles[locale] || titles.uk,
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
