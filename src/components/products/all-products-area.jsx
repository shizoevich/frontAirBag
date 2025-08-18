'use client';
'use client';
import React, { useState, useEffect } from "react";
import { useSearchParams } from 'next/navigation';
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from 'next-intl';
import { ShapeLine } from "@/svg";
import ProductItem from "./electronics/product-item";
import ErrorMsg from "@/components/common/error-msg";
import HomePrdLoader from "@/components/loader/home/home-prd-loader";
import { useGetShowCategoryQuery } from "@/redux/features/categoryApi";
import { useGetAllProductsQuery, useGetAllProductsNoLimitQuery } from "@/redux/features/productsApi";
import ReactPaginate from 'react-paginate';
import CategoryCarousel from "@/components/categories/category-carousel";
import ParentCategories from "@/components/categories/parent-categories";

// Fallback image URL
const FALLBACK_IMAGE = 'https://t3.ftcdn.net/jpg/04/34/72/82/360_F_434728286_OWQQvAFoXZLdGHlObozsolNeuSxhpr84.jpg';

const AllProductsArea = () => {
  const t = useTranslations('AllProductsArea');
  const tPagination = useTranslations('SearchArea');
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const [currentPage, setCurrentPage] = useState(0); // Для ReactPaginate (0-based)
  const [selectedParentCategory, setSelectedParentCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const itemsPerPage = 12; // Number of products per page
  
  // Получаем параметры из URL
  const urlCategoryId = searchParams?.get('categoryId');
  const urlCategoryName = searchParams?.get('categoryName');
  
  // Определяем выбранную категорию (из URL или из состояния)
  const selectedCategoryId = urlCategoryId ? parseInt(urlCategoryId) : selectedSubcategory || selectedParentCategory;
  
  // Родительские категории (известные ID)
  const parentCategoryIds = [754099, 754100, 754101]; // Covers, Комплектующие Airbag SRS, Пиропатроны
  
  // Определяем, является ли выбранная категория родительской
  const isParentCategory = selectedCategoryId && parentCategoryIds.includes(selectedCategoryId);
  
  useEffect(() => {
    setMounted(true);
    
    // Если есть categoryId в URL, устанавливаем его как выбранную категорию
    if (urlCategoryId) {
      const categoryId = parseInt(urlCategoryId);
      setSelectedSubcategory(categoryId);
      setSelectedParentCategory(null);
      setCurrentPage(0); // Сбрасываем на первую страницу
    }
  }, [urlCategoryId]);

  // Get categories for filter
  const {
    data: categoriesData,
    isLoading: catLoading,
    isError: catError
  } = useGetShowCategoryQuery();

  // Get products with pagination
  const {
    data: productsData = [],
    isLoading: productsLoading,
    isError: productsError
  } = useGetAllProductsQuery({
    limit: itemsPerPage,
    offset: currentPage * itemsPerPage,
    categoryId: isParentCategory ? undefined : selectedCategoryId, // Для подкатегорий
    parentCategoryId: isParentCategory ? selectedCategoryId : undefined // Для родительских категорий
  });
  
  // Get all products for filtering (without pagination)
  const {
    data: allProductsData,
    isLoading: allProductsLoading
  } = useGetAllProductsNoLimitQuery();

  // Convert categories data to array
  const allCategories = Array.isArray(categoriesData) 
    ? categoriesData 
    : Array.isArray(categoriesData?.data) 
      ? categoriesData.data 
      : Array.isArray(categoriesData?.results) 
        ? categoriesData.results 
        : [];
        
  console.log('Raw categoriesData:', categoriesData);
  console.log('Processed allCategories:', allCategories);
  console.log('Parent category IDs to find:', [754099, 754100, 754101]);
  
  // Проверяем, есть ли родительские категории в данных
  const parentCats = allCategories.filter(cat => [754099, 754100, 754101].includes(Number(cat.id)));
  console.log('Found parent categories:', parentCats);

  // Ensure productsData is always an array
  console.log('Raw productsData:', productsData);
  
  // Обрабатываем разные форматы данных API для текущей страницы
  let safeProductsData = [];
  
  if (Array.isArray(productsData)) {
    safeProductsData = productsData;
  } else if (productsData?.results && Array.isArray(productsData.results)) {
    safeProductsData = productsData.results;
  } else if (productsData?.data && Array.isArray(productsData.data)) {
    safeProductsData = productsData.data;
  }
  
  // Обрабатываем данные всех товаров для фильтрации
  let allProducts = [];
  
  if (allProductsData) {
    if (Array.isArray(allProductsData)) {
      allProducts = allProductsData;
    } else if (allProductsData?.results && Array.isArray(allProductsData.results)) {
      allProducts = allProductsData.results;
    } else if (allProductsData?.data && Array.isArray(allProductsData.data)) {
      allProducts = allProductsData.data;
    }
  }
  
  console.log('Processed products data:', safeProductsData);
  console.log('Selected category ID for filtering:', selectedCategoryId);
  console.log('URL category ID:', urlCategoryId);
  console.log('Selected subcategory:', selectedSubcategory);
  
  // Фильтруем товары по выбранной категории
  const filteredAllProducts = selectedCategoryId 
    ? allProducts.filter(product => {
        const categoryId = product.category?.id_remonline || product.category?.id || product.category_id;
        if (!categoryId) return false;
        
        const productCategoryId = parseInt(categoryId);
        const targetCategoryId = parseInt(selectedCategoryId);
        
        if (isParentCategory) {
          // Для родительской категории ищем товары, чьи категории имеют этот parent_id
          const productCategory = allCategories.find(cat => {
            const catId = cat.id_remonline || cat.id;
            return parseInt(catId) === productCategoryId;
          });
          
          console.log(`Parent category filter: product category ${productCategoryId}, parent_id: ${productCategory?.parent_id}, target parent: ${targetCategoryId}`);
          
          return productCategory && parseInt(productCategory.parent_id) === targetCategoryId;
        } else {
          // Для подкатегории сравниваем напрямую
          console.log(`Subcategory filter: comparing product category ${productCategoryId} with target ${targetCategoryId}`);
          return productCategoryId === targetCategoryId;
        }
      })
    : allProducts;
      
  // Для текущей страницы используем данные из API с пагинацией
  const filteredProducts = safeProductsData;

  // Calculate pagination - если есть фильтрация, используем отфильтрованные товары
  const totalCount = selectedCategoryId ? filteredAllProducts.length : (productsData?.count || 0);
  const pageCount = Math.ceil(totalCount / itemsPerPage);
  
  // Если есть фильтрация по категории, используем клиентскую пагинацию отфильтрованных товаров
  const currentProducts = selectedCategoryId 
    ? filteredAllProducts.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage)
    : filteredProducts; // Серверная пагинация для всех товаров
    
  console.log('Total count:', totalCount);
  console.log('Page count:', pageCount);
  console.log('Current products count:', currentProducts.length);

  // Handle page change - обновляем currentPage для запроса с пагинацией
  const handlePageClick = (event) => {
    setCurrentPage(event.selected);
    // Scroll to top of product section
    document.getElementById('all-products-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Handle parent category filter change
  const handleParentCategoryChange = (categoryId) => {
    setSelectedParentCategory(categoryId);
    setSelectedSubcategory(null); // Reset subcategory when parent category changes
    setCurrentPage(0); // Reset to first page when changing category
  };
  
  // Handle subcategory filter change
  const handleSubcategoryChange = (categoryId) => {
    setSelectedSubcategory(categoryId === selectedSubcategory ? null : categoryId);
    setCurrentPage(0); // Reset to first page when changing subcategory
  };

  if (!mounted) return null;

  // Products content
  let content = null;

  if (productsLoading) {
    content = <HomePrdLoader loading />;
  } else if (productsError) {
    content = <ErrorMsg msg={t('loadingError')} />;
  } else if (!currentProducts || currentProducts.length === 0) {
    content = <ErrorMsg msg={t('noProductsFound')} />;
  } else {
    content = currentProducts.map((product) => {
      // Ensure product has an id
      const productId = product?.id || product?._id || Math.random().toString(36).substr(2, 9);
      return (
        <div key={productId} className="col-xl-3 col-lg-3 col-sm-6">
          <ProductItem product={product} />
        </div>
      );
    });
  }

  // No longer using category filters in tabs since we have the carousel

  return (
    <section id="all-products-section" className="tp-product-area pb-55">
      <div className="container">
        <div className="row align-items-end">
          <div className="col-xl-5 col-lg-6 col-md-5">
            
          </div>
        </div>
        
        {/* Родительские категории (без фото) */}
        <div className="row">
          <div className="col-12">
            <ParentCategories
              categories={allCategories}
              isLoading={catLoading}
              isError={catError}
              selectedParentCategory={selectedParentCategory}
              onParentCategorySelect={handleParentCategoryChange}
            />
          </div>
        </div>
        
        {/* Подкатегории в карусели (с фото) */}
        <div className="row">
          <div className="col-12">
            <div className="tp-product-tab mb-45 tp-tab">
              <CategoryCarousel
                categories={allCategories}
                isLoading={catLoading}
                isError={catError}
                parentCategoryId={selectedParentCategory}
                selectedCategory={selectedSubcategory}
                onCategorySelect={handleSubcategoryChange}
                
              />
              <div className="tp-section-title-wrapper mb-40">
              <h3 className="tp-section-title">
                {t('ourProducts')}
                <ShapeLine />
              </h3>
            </div>
            </div>
          </div>
        </div>
        <div className="row">{content}</div>
        
        {/* Pagination */}
        {pageCount > 1 && (
          <div className="row">
            <div className="col-xl-12">
              <div className="tp-pagination mt-35">
                <ReactPaginate
                  breakLabel={tPagination('breakLabel')}
                  nextLabel={tPagination('nextPage')}
                  onPageChange={handlePageClick}
                  pageRangeDisplayed={3}
                  pageCount={pageCount}
                  previousLabel={tPagination('previousPage')}
                  renderOnZeroPageCount={null}
                  forcePage={currentPage}
                  containerClassName="tp-pagination-style mb-20 text-center"
                  pageLinkClassName="tp-pagination-link"
                  previousLinkClassName="tp-pagination-link"
                  nextLinkClassName="tp-pagination-link"
                  activeLinkClassName="active"
                  breakClassName="break-me"
                  disabledClassName="disabled"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default AllProductsArea;