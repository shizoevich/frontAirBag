import Wrapper from "@/layout/wrapper";
import Header from "@/layout/headers/header";
import Footer from "@/layout/footers/footer";
import ReturnsArea from "@/components/returns/returns-area";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const titles = { uk: 'Повернення товару', ru: 'Возврат товара', en: 'Returns' };
  const descs = {
    uk: 'Правила повернення та обміну товару в AirbagAD згідно із законодавством України.',
    ru: 'Правила возврата и обмена товара в AirbagAD согласно законодательству Украины.',
    en: 'Return and exchange policy at AirbagAD.',
  };
  return {
    title: `AirBag - ${titles[locale] || titles.uk}`,
    description: descs[locale] || descs.uk,
  };
}

export default async function ReturnsPage() {
  return (
    <Wrapper>
      <Header />
      <main className="main">
        <ReturnsArea />
      </main>
      <Footer primary_style={true} />
    </Wrapper>
  );
}
