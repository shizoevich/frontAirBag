'use client';
'use client';
import { useState, useEffect } from "react";
import { useTranslations } from 'next-intl';
// internal
import { Search } from "@/svg";
import NiceSelect from "@/ui/nice-select";
import useSearchFormSubmit from "@/hooks/use-search-form-submit";
import { useGetShowCategoryQuery } from "@/redux/features/categoryApi";

const HeaderSearchForm = () => {
  const t = useTranslations('HeaderSearchForm');
  const { setSearchText, setCategory, handleSubmit, searchText } = useSearchFormSubmit();
  const [categoryOptions, setCategoryOptions] = useState([]);
  
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

  // selectHandle
  const selectCategoryHandle = (e) => {
    setCategory(e.value);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="tp-header-search-wrapper d-flex align-items-center">
        <div className="tp-header-search-box">
          <input
            onChange={(e) => setSearchText(e.target.value)}
            value={searchText}
            type="text"
            placeholder={t('placeholder')}
          />
        </div>
        <div className="tp-header-search-category">
          <NiceSelect
            options={categoryOptions}
            defaultCurrent={0}
            onChange={selectCategoryHandle}
            name={t('selectCategory')}
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
