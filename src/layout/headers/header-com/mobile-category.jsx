'use client';
import { useState } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
// internal
import { useGetCategoryTreeQuery } from "@/redux/features/categoryApi";
import ErrorMsg from "@/components/common/error-msg";
import Loader from "@/components/loader/loader";
import { categoryPath } from "@/utils/category-link";
import { sortAlphabetically } from "@/utils/categoryTreeHelpers";

const MobileCategory = ({ isCategoryActive }) => {
  const { data: categoryTree, isError, isLoading } = useGetCategoryTreeQuery();
  const [isActiveSubMenu, setIsActiveSubMenu] = useState("");
  const locale = useLocale();
  const router = useRouter();

  // Открытие/закрытие подменю
  const handleOpenSubMenu = (title) => {
    setIsActiveSubMenu(prev => (prev === title ? "" : title));
  };

  // Переход по категории — на её собственную страницу, как и во всех остальных меню
  const goToCategory = (category) => {
    router.push(`/${locale}${categoryPath(category)}`);
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

  if (!isLoading && !isError && !categoryTree?.length) {
    content = <ErrorMsg msg="No Category found!" />;
  }

  if (!isLoading && !isError && categoryTree?.length > 0) {
    content = sortAlphabetically(categoryTree).map((item) => (
      <li className="has-dropdown" key={item.id}>
        <Link href={`/${locale}${categoryPath(item)}`}>
          {item.title}
          {item.children?.length > 0 && (
            <button
              onClick={(e) => {
                e.preventDefault();
                handleOpenSubMenu(item.title);
              }}
              className="dropdown-toggle-btn"
            >
              <i className="fa-regular fa-angle-right"></i>
            </button>
          )}
        </Link>

        {item.children?.length > 0 && (
          <ul
            className={`tp-submenu ${
              isActiveSubMenu === item.title ? "active" : ""
            }`}
          >
            {sortAlphabetically(item.children).map((child) => (
              <li key={child.id} onClick={() => goToCategory(child)}>
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
