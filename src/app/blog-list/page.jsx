import Wrapper from "@/layout/wrapper";
import Header from "@/layout/headers/header";
import SectionTitle from "@/components/blog/blog-grid/section-title";
import BlogGridArea from "@/components/blog/blog-grid/blog-grid-area";
import Footer from "@/layout/footers/footer";


export const metadata = {
  title: "Shofy - Blog List Page",
};

export default function BlogListPage() {
  return (
    <Wrapper>
      <Header />
      <SectionTitle/>
      <BlogGridArea list_area={true} />
      <Footer primary_style={true} />
    </Wrapper>
  );
}
