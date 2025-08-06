import Wrapper from "@/layout/wrapper";
import Header from "@/layout/headers/header";
import CommonBreadcrumb from "@/components/breadcrumb/common-breadcrumb";
import Footer from "@/layout/footers/footer";
import BrandSearchArea from "@/components/search/brand-search-area";

export const metadata = {
  title: "Shofy - Search by Brand",
};

export default function BrandSearchPage() {
  return (
    <Wrapper>
      <Header />
      <CommonBreadcrumb/>
      <BrandSearchArea />
      <Footer primary_style={true} />
    </Wrapper>
  );
}
