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
          // AIRBAG-96: используем DB id (как каталог /shop?category=), не id_remonline
          value: cat.id,
          text: cat.title
        });
      });
      
      setCategoryOptions(options);
    }
  }, [categoriesData, isLoading, t]);

  // selectHandle - автоматически запускаем поиск после выбора категории
  const selectCategoryHandle = (e) => {
    setCategory(e.value);
    
    // AIRBAG-96: выбор категории открывает её в каталоге (как в меню каталога),
    // /search категории не фильтрует. Ведём на /shop?category=<id>.
    if (e.value !== "Select Category") {
      const locale = pathname.split('/')[1] || 'uk';
      const queryParams = [`category=${e.value}`];
      if (searchText) {
        queryParams.push(`searchText=${encodeURIComponent(searchText)}`);
      }
      router.push(`/${locale}/shop?${queryParams.join('&')}`);
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
