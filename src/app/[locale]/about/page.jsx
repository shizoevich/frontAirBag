import Wrapper from "@/layout/wrapper";
import Header from "@/layout/headers/header";
import Footer from "@/layout/footers/footer";
import AboutArea from "@/components/about/about-area";

export async function generateMetadata({ params }) {
  const locale = params.locale;
  const titles = { uk: 'Про нас', ru: 'О нас', en: 'About us' };
  const descs = {
    uk: 'AirbagAD — постачальник запчастин AirBag SRS: подушки безпеки, ремені безпеки, піропатрони. Гарантія якості та доставка по Україні.',
    ru: 'AirbagAD — поставщик запчастей AirBag SRS: подушки безопасности, ремни безопасности, пиропатроны. Гарантия качества и доставка по Украине.',
    en: 'AirbagAD — supplier of AirBag SRS parts: airbags, seat belts, pyrotechnics.',
  };
  return {
    title: `AirBag - ${titles[locale] || titles.uk}`,
    description: descs[locale] || descs.uk,
  };
}

export default async function AboutPage() {
  return (
    <Wrapper>
      <Header />
      <main className="main">
        <AboutArea />
      </main>
      <Footer primary_style={true} />
    </Wrapper>
  );
}
