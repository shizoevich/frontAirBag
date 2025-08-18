import Wrapper from "@/layout/wrapper";
import Header from "@/layout/headers/header";
import Footer from "@/layout/footers/footer";
import CompareArea from "@/components/compare/compare-area";

export const metadata = {
  title: "AirBag - Compare Page",
};

export default function ComparePage() {
  return (
    <Wrapper>
      <Header />
      <CompareArea/>
      <Footer primary_style={true} />
    </Wrapper>
  );
}
