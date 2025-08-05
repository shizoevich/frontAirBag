import React from "react";
import Header from "@/layout/headers/header";
import Wrapper from "@/layout/wrapper";
import Footer from "@/layout/footers/footer";
import BlogDetailsArea from "@/components/blog-details/blog-details-area";
import blogData from "@/data/blog-data";

const BlogDetails = ({ params }) => {
  const blogItem = blogData.find((b) => Number(b.id) === Number(params.id));
  return (
    <Wrapper>
      <Header />
      <BlogDetailsArea blog={blogItem} />
      <Footer primary_style={true} />
    </Wrapper>
  );
};

export default BlogDetails;
