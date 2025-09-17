'use client';
import { useState, useEffect } from "react";
import { useTranslations } from 'next-intl';
import { useRouter, usePathname } from "next/navigation";
// internal
import { Search } from "@/svg";
import NiceSelect from "@/ui/nice-select";
import useSearchFormSubmit from "@/hooks/use-search-form-submit";
import { useGetShowCategoryQuery } from "@/redux/features/categoryApi";

const HeaderSearchForm = () => {
  const tForm = useTranslations('HeaderSearchForm');
  const t = useTranslations('ParentCategories');
  const router = useRouter();
  const pathname = usePathname();
  const { setSearchText, setCategory, handleSubmit, searchText } = useSearchFormSubmit();
  const [categoryOptions, setCategoryOptions] = useState([
    { value: "Select Category", text: t('selectCategory') }
  ]);
  
  // Get categories from API
  const { data: categoriesData, isLoading } = useGetShowCategoryQuery();
  
  useEffect(() => {
    if (categoriesData && !isLoading) {
      // Format categories for the dropdown
      const options = [
        { value: "Select Category", text: t('selectCategory') }
      ];
      
      // Add categories from API
      const categories = Array.isArray(categoriesData) 
        ? categoriesData 
        : Array.isArray(categoriesData?.data) 
          ? categoriesData.data 
          : Array.isArray(categoriesData?.results) 
            ? categoriesData.results 
            : [];
            
      categories.forEach(cat => {
        options.push({
          value: cat.id_remonline || cat.id,
          text: cat.title
        });
      });
      
      setCategoryOptions(options);
    }
  }, [categoriesData, isLoading]);

  // selectHandle - автоматически запускаем поиск после выбора категории
  const selectCategoryHandle = (e) => {
    setCategory(e.value);
    
    // Если выбрана реальная категория (не "Select Category"), запускаем поиск автоматически
    if (e.value !== "Select Category") {
      // Создаем прямой переход на страницу поиска без сброса полей
      const queryParams = [];
      if (searchText) {
        queryParams.push(`searchText=${searchText}`);
      }
      queryParams.push(`categoryId=${e.value}`);

      // Extract current locale from pathname
      const locale = pathname.split('/')[1] || 'uk';
      const route = `/${locale}/search?${queryParams.join('&')}`;
      
      // Используем Next.js router для немедленного перехода
      router.push(route);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="tp-header-search-wrapper d-flex align-items-center">
        <div className="tp-header-search-box">
          <input
            onChange={(e) => setSearchText(e.target.value)}
            value={searchText}
            type="text"
            placeholder={tForm('placeholder')}
          />
        </div>
        <div className="tp-header-search-category">
          <NiceSelect
            options={categoryOptions}
            defaultCurrent={0}
            onChange={selectCategoryHandle}
            name="category"
            placeholder={t('selectCategory')}
            className="custom-nice-select"
          />
        </div>
        <div className="tp-header-search-btn">
          <button type="submit">
            <Search />
          </button>
        </div>
      </div>
    </form>
  );
};

export default HeaderSearchForm;
