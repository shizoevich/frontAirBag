import Wrapper from "@/layout/wrapper";
import Header from "@/layout/headers/header";
import Footer from "@/layout/footers/footer";
import CommonBreadcrumb from "@/components/breadcrumb/common-breadcrumb";
import CompareArea from "@/components/compare/compare-area";

export const metadata = {
  title: "AirBag - Compare Page",
};

export default function ComparePage() {
  return (
    <Wrapper>
      <Header />
      <CommonBreadcrumb title="Compare" subtitle="Compare" />
      <CompareArea/>
      <Footer primary_style={true} />
    </Wrapper>
  );
}
