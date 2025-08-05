'use client';
import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useGetShowCategoryQuery } from "@/redux/features/categoryApi";
import ErrorMsg from "@/components/common/error-msg";
import Loader from "@/components/loader/loader";
import { getProductImage } from "@/utils/image-utils";

const HeaderCategory = ({ isCategoryActive }) => {
  const { data: categories, isError, isLoading } = useGetShowCategoryQuery();
  const router = useRouter();

  const handleCategoryRoute = (categoryId, title, type = "parent") => {
    if (type === "parent") {
      router.push(`/shop?categoryId=${categoryId}`);
    } else {
      router.push(`/shop?categoryId=${categoryId}`);
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
    content = categories.map((item) => {
      const categoryId = item.id_remonline || item.id;
      const categoryImage = item.img || `/assets/img/category/${item.title.toLowerCase().replace(/\s+/g, '-')}.jpg`;
      
      return (
        <li className="has-dropdown" key={categoryId}>
          <a
            className="cursor-pointer"
            onClick={() => handleCategoryRoute(categoryId, item.title, "parent")}
          >
            <span>
              <Image 
                src={getProductImage(categoryImage)} 
                alt={item.title} 
                width={50} 
                height={50} 
              />
            </span>
            {item.title}
          </a>

          {item.children?.length > 0 && (
            <ul className="tp-submenu">
              {item.children.map((child) => {
                const childId = child.id_remonline || child.id;
                return (
                  <li
                    key={childId}
                    onClick={() => handleCategoryRoute(childId, child.title, "child")}
                  >
                    <a className="cursor-pointer">{child.title}</a>
                  </li>
                );
              })}
            </ul>
          )}
        </li>
      );
    });
  }

  return <ul className={isCategoryActive ? "active" : ""}>{content}</ul>;
};

export default HeaderCategory;

