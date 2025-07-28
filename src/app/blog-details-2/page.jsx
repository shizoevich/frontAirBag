import Wrapper from "@/layout/wrapper";
import HeaderTwo from "@/layout/headers/header-2";
import blogData from "@/data/blog-data";
import BlogDetailsAreaTwo from "@/components/blog-details/blog-details-area-2";
import Footer from "@/layout/footers/footer";


export const metadata = {
  title: "Shofy - Blog Details 2 Page",
};

export default function BlogDetailsPageTwo() {
  return (
    <Wrapper>
      <HeaderTwo style_2={true} />
      <BlogDetailsAreaTwo blog={blogData[4]} />
      <Footer primary_style={true} />
    </Wrapper>
  );
}