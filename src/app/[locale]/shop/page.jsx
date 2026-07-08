import { Suspense } from "react";
import Wrapper from "@/layout/wrapper";
import Header from "@/layout/headers/header";
import Footer from "@/layout/footers/footer";
import AllProductsArea from "@/components/products/all-products-area";
import HomePrdLoader from "@/components/loader/home/home-prd-loader";
import { buildAlternates } from "@/utils/seo";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const meta = {
    uk: {
      title: 'Магазин автозапчастин безпеки',
      description: 'Каталог AirbagAD: подушки безпеки, ремені безпеки, піропатрони, пульки та парашути. Купівля та доставка по Дніпру та Україні.',
    },
    ru: {
      title: 'Магазин автозапчастей безопасности',
      description: 'Каталог AirbagAD: подушки безопасности, ремни безопасности, пиропатроны, пульки и парашюты. Покупка и доставка по Днепру и Украине.',
    },
    en: {
      title: 'Shop — car safety parts',
      description: 'AirbagAD catalog: airbags, seat belts, pyrotechnics (squibs) and airbag bags. Purchase and delivery across Dnipro and Ukraine.',
    },
  };
  const m = meta[locale] || meta.ru;
  return {
    title: m.title,
    description: m.description,
    alternates: buildAlternates('shop', locale),
  };
}

export default async function ShopPage({ params }) {
  const { locale } = await params;
  
  return (
    <Wrapper>
      <Header />
      <section className="tp-product-area pt-40 ">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <h5 className="tp-section-subtitle">Оберіть категорію</h5>
            </div>
          </div>
        </div>
      </section>
      <Suspense fallback={
        <section className="tp-product-area pb-55">
          <div className="container">
            <HomePrdLoader loading />
          </div>
        </section>
      }>
        <AllProductsArea />
      </Suspense>
      <Footer primary_style={true} />
    </Wrapper>
  );
}