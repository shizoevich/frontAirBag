import Wrapper from "@/layout/wrapper";
import Header from "@/layout/headers/header";
import Footer from "@/layout/footers/footer";
import BlogDetailsArea from "@/components/blog-details/blog-details-area";
import blogData from "@/data/blog-data";


export const metadata = {
  title: "Shofy - Blog Details Page",
};

export default function BlogDetailsPage() {
  return (
    <Wrapper>
      <Header />
      <BlogDetailsArea blog={blogData[4]} />
      <Footer primary_style={true} />
    </Wrapper>
  );
}
