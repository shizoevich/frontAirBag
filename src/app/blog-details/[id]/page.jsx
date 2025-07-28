import React from "react";
import HeaderTwo from "@/layout/headers/header-2";
import Wrapper from "@/layout/wrapper";
import Footer from "@/layout/footers/footer";
import BlogDetailsArea from "@/components/blog-details/blog-details-area";
import blogData from "@/data/blog-data";

const BlogDetails = ({ params }) => {
  const blogItem = blogData.find((b) => Number(b.id) === Number(params.id));
  return (
    <Wrapper>
      <HeaderTwo style_2={true} />
      <BlogDetailsArea blog={blogItem} />
      <Footer primary_style={true} />
    </Wrapper>
  );
};

export default BlogDetails;
