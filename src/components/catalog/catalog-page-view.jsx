import { Suspense } from "react";
import Wrapper from "@/layout/wrapper";
import Header from "@/layout/headers/header";
import Footer from "@/layout/footers/footer";
import CtaArea from "@/components/cta/cta-area";
import FeatureArea from "@/components/features/feature-area";
import DeliveryCities from "@/components/features/delivery-cities";
import CatalogArea from "@/components/products/catalog-area";
import MobileSearch from "@/components/search/mobile-search";
import YouTubeVideosSlider from "@/components/youtube/youtube-videos-slider";
import HomePrdLoader from "@/components/loader/home/home-prd-loader";

/**
 * Вид витрины целиком: баннер, поиск, каталог, видео, города доставки, CTA.
 *
 * Главная и страница категории — это ОДИН и тот же вид, отличаются они только
 * предвыбранной категорией и метаданными. Держим его здесь, чтобы страница категории
 * не могла снова стать «обрезанной» версией главной, если на главную добавят секцию.
 */
export default function CatalogPageView({ locale, activeCategoryId = null }) {
  return (
    <Wrapper>
      <Header />
      <FeatureArea locale={locale} />
      <MobileSearch />
      {/* Оставляем клиентский раздел для интерактива, фильтров и пагинации */}
      <Suspense fallback={<HomePrdLoader loading />}>
        <CatalogArea activeCategoryId={activeCategoryId} />
      </Suspense>
      <YouTubeVideosSlider key={`youtube-${Date.now()}`} />
      <DeliveryCities locale={locale} />
      <CtaArea />
      <Footer />
    </Wrapper>
  );
}
