import React from "react";
import HeaderTwo from "@/layout/headers/header-2";
import Wrapper from "@/layout/wrapper";
import blogData from "@/data/blog-data";
import BlogDetailsAreaTwo from "@/components/blog-details/blog-details-area-2";
import Footer from "@/layout/footers/footer";

export const metadata = {
  title: "Shofy - Blog Details 2 Page",
};

export default function BlogDetailsPageTwo({ params }) {
  const blogItem = blogData.find((b) => Number(b.id) === Number(params.id));
  return (
    <Wrapper>
      <HeaderTwo style_2={true} />
      <BlogDetailsAreaTwo blog={blogItem} />
      <Footer primary_style={true} />
    </Wrapper>
  );
}
