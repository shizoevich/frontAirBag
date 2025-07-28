'use client';
import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useGetShowCategoryQuery } from "@/redux/features/categoryApi";
import ErrorMsg from "@/components/common/error-msg";
import Loader from "@/components/loader/loader";

const HeaderCategory = ({ isCategoryActive }) => {
  const { data: categories, isError, isLoading } = useGetShowCategoryQuery();
  const router = useRouter();

  const handleCategoryRoute = (title, type = "parent") => {
    const route = title.toLowerCase().replace("&", "").split(" ").join("-");
    if (type === "parent") {
      router.push(`/shop?category=${route}`);
    } else {
      router.push(`/shop?subCategory=${route}`);
    }
  };

  let content = null;

  if (isLoading) {
    content = (
      <div className="py-5">
        <Loader loading={isLoading} />
      </div>
    );
  }

  if (!isLoading && isError) {
    content = <ErrorMsg msg="There was an error" />;
  }

  if (!isLoading && !isError && categories?.length === 0) {
    content = <ErrorMsg msg="No Category found!" />;
  }

  if (!isLoading && !isError && categories?.length > 0) {
    content = categories.map((item) => (
      <li className="has-dropdown" key={item.id}>
        <a
          className="cursor-pointer"
          onClick={() => handleCategoryRoute(item.title, "parent")}
        >
          {item.img && (
            <span>
              <Image src={item.img} alt="cate img" width={50} height={50} />
            </span>
          )}
          {item.title}
        </a>

        {item.children?.length > 0 && (
          <ul className="tp-submenu">
            {item.children.map((child) => (
              <li
                key={child.id}
                onClick={() => handleCategoryRoute(child.title, "child")}
              >
                <a className="cursor-pointer">{child.title}</a>
              </li>
            ))}
          </ul>
        )}
      </li>
    ));
  }

  return <ul className={isCategoryActive ? "active" : ""}>{content}</ul>;
};

export default HeaderCategory;

