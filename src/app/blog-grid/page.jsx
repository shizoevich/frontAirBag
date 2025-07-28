import Wrapper from "@/layout/wrapper";
import HeaderTwo from "@/layout/headers/header-2";
import SectionTitle from "@/components/blog/blog-grid/section-title";
import BlogGridArea from "@/components/blog/blog-grid/blog-grid-area";
import Footer from "@/layout/footers/footer";


export const metadata = {
  title: "Shofy - Blog Grid Page",
};

export default function BlogGridPage() {
  return (
    <Wrapper>
      <HeaderTwo style_2={true} />
      <SectionTitle />
      <BlogGridArea />
      <Footer primary_style={true} />
    </Wrapper>
  );
}
