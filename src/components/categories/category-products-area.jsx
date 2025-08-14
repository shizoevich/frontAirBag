'use client';
import React, { useState, useEffect } from "react";
import ProductItem from "../products/electronics/product-item";
import ErrorMsg from "@/components/common/error-msg";
import HomePrdLoader from "@/components/loader/home/home-prd-loader";
import { useGetShowCategoryQuery, useGetAllProductsQuery } from "@/redux/features/categoryApi";
import ReactPaginate from 'react-paginate';
import { useTranslations } from 'next-intl';

const CategoryProductsArea = ({ categorySlug }) => {
  const tSearch = useTranslations('SearchArea');
  const tProducts = useTranslations('AllProductsArea');
  const tCategories = useTranslations('Categories');
  
  const [mounted, setMounted] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 12; // Количество товаров на странице
  
  useEffect(() => {
    setMounted(true);
  }, []);

  // Получаем категории для фильтрации
  const {
    data: categoriesData,
    isLoading: catLoading,
    isError: catError
  } = useGetShowCategoryQuery();

  // Получаем все товары
  const {
    data: productsData = [],
    isLoading: productsLoading,
    isError: productsError
  } = useGetAllProductsQuery();

  // Преобразуем данные категорий в массив
  const allCategories = Array.isArray(categoriesData) 
    ? categoriesData 
    : Array.isArray(categoriesData?.data) 
      ? categoriesData.data 
      : Array.isArray(categoriesData?.results) 
        ? categoriesData.results 
        : [];
  
  // Обрабатываем разные форматы данных API
  let safeProductsData = [];
  
  if (Array.isArray(productsData)) {
    safeProductsData = productsData;
  } else if (productsData?.results && Array.isArray(productsData.results)) {
    safeProductsData = productsData.results;
  } else if (productsData?.data && Array.isArray(productsData.data)) {
    safeProductsData = productsData.data;
  }

  // Находим ID категории по slug
  const getCategoryIdBySlug = (slug) => {
    // Маппинг slug на ID категорий
    const slugToIdMap = {
      'airbag-components': 754100, // ID для "Комплектующие Airbag SRS"
      'pyrotechnics': 754101, // ID для "Пиропатроны"
      'covers': 754099 // ID для "Covers"
    };
    
    return slugToIdMap[slug] || null;
  };
  
  // Получаем ID категории по slug
  const categoryId = getCategoryIdBySlug(categorySlug);
  
  // Фильтруем товары по выбранной категории
  const filteredProducts = categoryId 
    ? safeProductsData.filter(product => {
        // Проверяем все возможные форматы ID категории
        const productCategoryId = product.category?.id_remonline || product.category?.id || product.category_id;
        
        if (!productCategoryId) return false;
        
        // Находим категорию товара
        const productCategory = allCategories.find(cat => 
          String(cat.id) === String(productCategoryId) || 
          String(cat.id_remonline) === String(productCategoryId)
        );
        
        if (!productCategory) return false;
        
        // Проверяем, принадлежит ли товар к выбранной категории или её подкатегориям
        return String(productCategory.id) === String(categoryId) || 
               String(productCategory.parent_id) === String(categoryId);
      })
    : safeProductsData;
  
  // Расчет пагинации
  const pageCount = Math.ceil(filteredProducts.length / itemsPerPage);
  const offset = currentPage * itemsPerPage;
  const currentProducts = filteredProducts.slice(offset, offset + itemsPerPage);
  
  // Обработка изменения страницы
  const handlePageClick = (event) => {
    setCurrentPage(event.selected);
  };

  // Получаем название категории
  const getCategoryName = () => {
    if (categoryId) {
      const category = allCategories.find(cat => String(cat.id) === String(categoryId));
      return category?.name || categorySlug;
    }
    return categorySlug;
  };

  // Получаем описание категории
  const getCategoryDescription = () => {
    if (categorySlug === 'airbag-components') {
      return tCategories('airbag_components_seo_description');
    } else if (categorySlug === 'pyrotechnics') {
      return tCategories('pyrotechnics_seo_description');
    }
    return '';
  };

  return (
    <section className="tp-product-area pb-90">
      <div className="container">
        <div className="row">
          <div className="col-xl-12">
            <div className="tp-section-title-wrapper-2 mb-40">
              <h3 className="tp-section-title-2">{getCategoryName()}</h3>
              <p className="text-muted">{getCategoryDescription()}</p>
            </div>
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
                  <div className="row">
                    {productsLoading && !productsError && (
                      <HomePrdLoader loading={productsLoading} />
                    )}
                    {!productsLoading && productsError && (
                      <ErrorMsg msg={tProducts('loadingError')} />
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

export default CategoryProductsArea;