'use client';
import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
// internal
import { useGetShowCategoryQuery } from "@/redux/features/categoryApi";
import ErrorMsg from "@/components/common/error-msg";
import Loader from "@/components/loader/loader";

const MobileCategory = ({ isCategoryActive }) => {
  const { data: categories, isError, isLoading } = useGetShowCategoryQuery();
  const [isActiveSubMenu, setIsActiveSubMenu] = useState("");
  const router = useRouter();

  // Открытие/закрытие подменю
  const handleOpenSubMenu = (title) => {
    setIsActiveSubMenu(prev => (prev === title ? "" : title));
  };

  // Переход по категории
  const handleCategoryRoute = (title, type = "parent") => {
    const slug = title.toLowerCase().replace("&", "").split(" ").join("-");
    if (type === "parent") {
      router.push(`/shop?category=${slug}`);
    } else {
      router.push(`/shop?subCategory=${slug}`);
    }
  };

  // Контент
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
        <a className="cursor-pointer">
          {item.img && (
            <span>
              <Image src={item.img} alt="cate img" width={50} height={50} />
            </span>
          )}
          {item.title}
          {item.children?.length > 0 && (
            <button
              onClick={() => handleOpenSubMenu(item.title)}
              className="dropdown-toggle-btn"
            >
              <i className="fa-regular fa-angle-right"></i>
            </button>
          )}
        </a>

        {item.children?.length > 0 && (
          <ul
            className={`tp-submenu ${
              isActiveSubMenu === item.title ? "active" : ""
            }`}
          >
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

export default MobileCategory;
