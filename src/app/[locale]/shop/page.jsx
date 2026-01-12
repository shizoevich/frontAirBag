import { Suspense } from "react";
import Wrapper from "@/layout/wrapper";
import Header from "@/layout/headers/header";
import Footer from "@/layout/footers/footer";
import AllProductsArea from "@/components/products/all-products-area";
import HomePrdLoader from "@/components/loader/home/home-prd-loader";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  return {
    title: `AirBag - ${locale === 'uk' ? 'Магазин' : locale === 'ru' ? 'Магазин' : 'Shop Page'}`,
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