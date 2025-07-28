import Wrapper from "@/layout/wrapper";
import HeaderTwo from "@/layout/headers/header-2";
import BlogBreadcrumb from "@/components/breadcrumb/blog-breadcrumb";
import BlogPostboxArea from "@/components/blog/blog-postox/blog-postbox-area";
import Footer from "@/layout/footers/footer";

export const metadata = {
  title: "Shofy - Blog Page",
};

export default function BlogPage() {
  return (
    <Wrapper>
      <HeaderTwo style_2={true} />
      <BlogBreadcrumb />
      <BlogPostboxArea />
      <Footer primary_style={true} />
    </Wrapper>
  );
}
