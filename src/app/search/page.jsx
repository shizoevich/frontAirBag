import Wrapper from "@/layout/wrapper";
import Header from "@/layout/headers/header";
import CommonBreadcrumb from "@/components/breadcrumb/common-breadcrumb";
import SearchArea from "@/components/search/search-area";
import Footer from "@/layout/footers/footer";


export const metadata = {
  title: "Shofy - Search Page",
};

export default function SearchPage() {
  return (
    <Wrapper>
      <Header />
      <CommonBreadcrumb title="Search Products" subtitle="Search Products" />
      <SearchArea />
      <Footer primary_style={true} />
    </Wrapper>
  );
}
