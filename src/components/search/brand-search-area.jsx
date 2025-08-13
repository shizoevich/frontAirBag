'use client';
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShapeLine } from "@/svg";
import ProductItem from "../products/electronics/product-item";
import ErrorMsg from "@/components/common/error-msg";
import HomePrdLoader from "@/components/loader/home/home-prd-loader";
import { useGetShowCategoryQuery, useGetAllProductsQuery } from "@/redux/features/categoryApi";
import ReactPaginate from 'react-paginate';
import CategoryCarousel from "@/components/categories/category-carousel";
import ParentCategories from "@/components/categories/parent-categories";
import { useTranslations } from 'next-intl';

// Fallback image URL
const FALLBACK_IMAGE = 'https://t3.ftcdn.net/jpg/04/34/72/82/360_F_434728286_OWQQvAFoXZLdGHlObozsolNeuSxhpr84.jpg';

const BrandSearchArea = () => {
  const t = useTranslations('Categories');
  const tSearch = useTranslations('SearchArea');
  const tProducts = useTranslations('AllProductsArea');
  
  const [mounted, setMounted] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedParentCategory, setSelectedParentCategory] = useState(754099); // По умолчанию выбрана категория Covers (автомобили)
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const itemsPerPage = 12; // Number of products per page
  
  useEffect(() => {
    setMounted(true);
  }, []);

  // Get categories for filter
  const {
    data: categoriesData,
    isLoading: catLoading,
    isError: catError
  } = useGetShowCategoryQuery();

  // Get all products
  const {
    data: productsData = [],
    isLoading: productsLoading,
    isError: productsError
  } = useGetAllProductsQuery();

  // Convert categories data to array
  const allCategories = Array.isArray(categoriesData) 
    ? categoriesData 
    : Array.isArray(categoriesData?.data) 
      ? categoriesData.data 
      : Array.isArray(categoriesData?.results) 
        ? categoriesData.results 
        : [];
  
  // Проверяем, есть ли родительские категории в данных
  const parentCats = allCategories.filter(cat => [754099, 754100, 754101].includes(Number(cat.id)));

  // Обрабатываем разные форматы данных API
  let safeProductsData = [];
  
  if (Array.isArray(productsData)) {
    safeProductsData = productsData;
  } else if (productsData?.results && Array.isArray(productsData.results)) {
    safeProductsData = productsData.results;
  } else if (productsData?.data && Array.isArray(productsData.data)) {
    safeProductsData = productsData.data;
  }

  // Получаем все подкатегории для выбранной родительской категории (марки автомобилей)
  const carBrands = allCategories.filter(cat => 
    String(cat.parent_id) === String(selectedParentCategory)
  );

  // Фильтрация брендов по поисковому запросу
  const filteredBrands = searchQuery 
    ? carBrands.filter(brand => 
        brand.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (brand.description && brand.description.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : carBrands;

  // Filter products by selected subcategory or parent category
  const filteredProducts = selectedSubcategory 
    ? safeProductsData.filter(product => {
        // Check all possible category ID formats
        const categoryId = product.category?.id_remonline || product.category?.id || product.category_id;
        
        // More robust comparison
        if (!categoryId && !selectedSubcategory) return true;
        if (!categoryId) return false;
        
        const productCategoryId = String(categoryId).trim();
        const selectedCategoryId = String(selectedSubcategory).trim();
        
        return productCategoryId === selectedCategoryId;
      })
    : selectedParentCategory 
      ? safeProductsData.filter(product => {
          // Если выбрана родительская категория, но не выбрана подкатегория,
          // показываем товары всех подкатегорий этой родительской категории
          const categoryId = product.category?.id_remonline || product.category?.id || product.category_id;
          if (!categoryId) return false;
          
          // Находим категорию товара
          const productCategory = allCategories.find(cat => 
            String(cat.id) === String(categoryId) || 
            String(cat.id_remonline) === String(categoryId)
          );
          
          if (!productCategory) return false;
          
          // Проверяем, является ли категория товара подкатегорией выбранной родительской категории
          return String(productCategory.parent_id) === String(selectedParentCategory);
        })
      : safeProductsData; // Если ничего не выбрано, показываем все товары
  
  // Calculate pagination
  const pageCount = Math.ceil(filteredProducts.length / itemsPerPage);
  const offset = currentPage * itemsPerPage;
  const currentProducts = filteredProducts.slice(offset, offset + itemsPerPage);
  
  // Handle page change
  const handlePageClick = (event) => {
    setCurrentPage(event.selected);
  };
  
  // Handle parent category selection
  const handleParentCategoryChange = (categoryId) => {
    setSelectedParentCategory(categoryId);
    setSelectedSubcategory(null); // Reset subcategory when parent category changes
    setCurrentPage(0); // Reset pagination
    setSearchQuery(''); // Reset search query
  };
  
  // Handle subcategory selection
  const handleSubcategoryChange = (categoryId) => {
    setSelectedSubcategory(categoryId);
    setCurrentPage(0); // Reset pagination
  };

  // Handle search query change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Get selected category name
  const getSelectedCategoryName = () => {
    if (selectedSubcategory) {
      const subcat = allCategories.find(cat => String(cat.id) === String(selectedSubcategory));
      return subcat?.name || '';
    } else if (selectedParentCategory) {
      const parentCat = allCategories.find(cat => String(cat.id) === String(selectedParentCategory));
      return parentCat?.name || '';
    }
    return '';
  };

  return (
    <section className="tp-product-area pb-90">
      <div className="container">
        <div className="row">
          <div className="col-xl-12">
            <div className="tp-section-title-wrapper-2 mb-40">
              <h3 className="tp-section-title-2">{t('car_brands')}</h3>
              <p className="text-muted">{t('search_parts_by_car_brand')}</p>
            </div>
          </div>
        </div>
        
        {/* Родительские категории */}
        <div className="row mb-40">
          <div className="col-xl-12">
            <ParentCategories 
              categories={allCategories} 
              selectedParentCategory={selectedParentCategory} 
              onSelectParentCategory={handleParentCategoryChange} 
            />
          </div>
        </div>
        
        {/* Карусель подкатегорий (марки автомобилей) */}
        <div className="row mb-40">
          <div className="col-xl-12">
            <CategoryCarousel 
              categories={filteredBrands} 
              parentCategoryId={selectedParentCategory} 
              selectedSubcategory={selectedSubcategory} 
              onSelectSubcategory={handleSubcategoryChange} 
              searchQuery={searchQuery}
              noResultsMessage={t('noBrandsFound')}
            />
          </div>
        </div>
        
        {/* Товары */}
        <div className="row">
          <div className="col-xl-12">
            <div className="tp-product-tab-content">
              <div className="tab-content" id="myTabContent">
                <div
                  className="tab-pane fade show active"
                  id="all-tab-pane"
                  role="tabpanel"
                  aria-labelledby="all-tab"
                  tabIndex="0"
                >
                  {selectedSubcategory && (
                    <div className="mb-20">
                      <h4>{getSelectedCategoryName()}</h4>
                    </div>
                  )}
                  
                  <div className="row">
                    {productsLoading && !productsError && (
                      <HomePrdLoader loading={productsLoading} />
                    )}
                    {!productsLoading && productsError && (
                      <ErrorMsg msg={t('loadingError')} />
                    )}
                    {!productsLoading && !productsError && currentProducts.length === 0 && (
                      <ErrorMsg msg={tProducts('noProductsFound')} />
                    )}
                    {!productsLoading && !productsError && currentProducts.length > 0 && 
                      currentProducts.map((item) => (
                        <div key={item.id} className="col-xl-3 col-lg-4 col-md-6 col-sm-6">
                          <ProductItem product={item} />
                        </div>
                      ))
                    }
                  </div>
                  
                  {/* Pagination */}
                  {pageCount > 1 && (
                    <div className="tp-pagination mt-20">
                      <ReactPaginate
                        breakLabel={tSearch('breakLabel')}
                        nextLabel={tSearch('nextPage')}
                        onPageChange={handlePageClick}
                        pageRangeDisplayed={3}
                        pageCount={pageCount}
                        previousLabel={tSearch('previousPage')}
                        renderOnZeroPageCount={null}
                        containerClassName="tp-pagination-nav"
                        pageLinkClassName="tp-pagination-link"
                        previousLinkClassName="tp-pagination-link"
                        nextLinkClassName="tp-pagination-link"
                        activeLinkClassName="active"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BrandSearchArea;
