'use client';
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
// internal
import ErrorMsg from "../common/error-msg";
import { ArrowRightLong } from "@/svg";
import { HomeTwoCateLoader } from "../loader";
import { getRootCategories } from "@/data/categories"; // путь скорректируй под себя

const FashionCategory = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [isError, setError] = useState(false);
  const router = useRouter();

  useEffect(() => {
    try {
      const rootCats = getRootCategories();
      setCategories(rootCats);
      setError(false);
    } catch (e) {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCategoryRoute = (title) => {
    const slug = title
      .toLowerCase()
      .replace("&", "")
      .split(" ")
      .join("-");
    router.push(`/shop?category=${slug}`);
  };

  let content = null;

  if (isLoading) {
    content = <HomeTwoCateLoader loading={true} />;
  } else if (isError) {
    content = <ErrorMsg msg="There was an error" />;
  } else if (categories.length === 0) {
    content = <ErrorMsg msg="No Category found!" />;
  } else {
    content = categories.map((item) => (
      <div key={item.id} className="col-xxl-4 col-lg-6">
        <div className="tp-banner-item-2 p-relative z-index-1 grey-bg-2 mb-20 fix">
          <div
            className="tp-banner-thumb-2 include-bg transition-3"
            style={{ backgroundImage: `url(/images/categories/${item.image})` }} // путь адаптируй
          ></div>
          <h3 className="tp-banner-title-2">
            <span onClick={() => handleCategoryRoute(item.title)} className="cursor-pointer">
              {item.title}
            </span>
          </h3>
          <div className="tp-banner-btn-2">
            <span
              onClick={() => handleCategoryRoute(item.title)}
              className="cursor-pointer tp-btn tp-btn-border tp-btn-border-sm"
            >
              Shop Now <ArrowRightLong />
            </span>
          </div>
        </div>
      </div>
    ));
  }

  return (
    <section className="tp-banner-area mt-20">
      <div className="container-fluid tp-gx-40">
        <div className="row tp-gx-20">{content}</div>
      </div>
    </section>
  );
};

export default FashionCategory;
