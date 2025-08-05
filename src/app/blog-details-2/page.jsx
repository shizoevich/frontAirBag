import Wrapper from "@/layout/wrapper";
import Header from "@/layout/headers/header";
import blogData from "@/data/blog-data";
import BlogDetailsAreaTwo from "@/components/blog-details/blog-details-area-2";
import Footer from "@/layout/footers/footer";


export const metadata = {
  title: "Shofy - Blog Details 2 Page",
};

export default function BlogDetailsPageTwo() {
  return (
    <Wrapper>
      <Header />
      <BlogDetailsAreaTwo blog={blogData[4]} />
      <Footer primary_style={true} />
    </Wrapper>
  );
}