'use client';
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";

const useSearchFormSubmit = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [searchText, setSearchText] = useState("");
  const [category, setCategory] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    const isSearchable = searchText || (category && category !== "Select Category");

    if (isSearchable) {
      const queryParams = [];
      if (searchText) {
        queryParams.push(`searchText=${searchText}`);
      }
      if (category && category !== "Select Category") {
        queryParams.push(`categoryId=${category}`);
      }

      // Extract current locale from pathname
      const locale = pathname.split('/')[1] || 'uk';
      // Запрос ведёт на витрину, а не на отдельную страницу поиска: он её состояние.
      // Адрес всегда без категории — новый запрос снимает выбранную, как и наоборот.
      const route = `/${locale}?${queryParams.join('&')}`;
      router.push(route);

      // Reset fields after search
      setSearchText("");
      setCategory("");
    }
    // If nothing is entered, do nothing, preventing the redirect to home.
  };

  return {
    searchText,
    category,
    setSearchText,
    setCategory,
    handleSubmit,
  };
};

export default useSearchFormSubmit;
