'use client';
import React, { useState, useEffect } from "react";
import ProductItem from "../products/electronics/product-item";
import ErrorMsg from "@/components/common/error-msg";
import HomePrdLoader from "@/components/loader/home/home-prd-loader";
import { useGetShowCategoryQuery } from "@/redux/features/categoryApi";
import { useGetProductsByCategoryQuery } from "@/redux/features/productsApi";
import ReactPaginate from 'react-paginate';
import { useTranslations } from 'next-intl';

const ShopSubcategoryArea = ({ subcategorySlug }) => {
  const tSearch = useTranslations('SearchArea');
  const tProducts = useTranslations('AllProductsArea');
  const tCategories = useTranslations('Categories');
  
  const [mounted, setMounted] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 12; // Количество товаров на странице
  
  useEffect(() => {
    setMounted(true);
  }, []);

  // Получаем категории для отображения информации
  const {
    data: categoriesData,
    isLoading: catLoading,
    isError: catError
  } = useGetShowCategoryQuery();

  // Маппинг slug на ID категорий
  const slugToIdMap = {
    'connectors': 753917, // ID для "Коннекторы"
    'mounts': 753918, // ID для "Крепления"
    'resistors': 753919, // ID для "Обманки ( Резисторы )"
    'airbags': 753897, // ID для "Парашюты ( Мешки )"
    'belt-parts': 753899, // ID для "Запчасти для Ремней"
    'pyro-belts': 753920, // ID для "ПП в Ремни"
    'pyro-seats': 753898, // ID для "ПП в Ноги/Сиденье"
    'pyro-curtains': 753924, // ID для "ПП в Шторы"
    'pyro-steering': 753925, // ID для "2 запала" (руль)
    'pyro-dashboard': 753927, // ID для "2 запала" (панель)
    'covers': 754099 // ID для "Covers"
  };
  
  // Получаем ID подкатегории по slug
  const subcategoryId = slugToIdMap[subcategorySlug] || null;
  console.log('Selected subcategoryId:', subcategoryId);
  
  // Получаем товары по категории с серверной пагинацией
  const {
    data: productsData = [],
    isLoading: productsLoading,
    isError: productsError
  } = useGetProductsByCategoryQuery({
    id_remonline: subcategoryId,
    limit: itemsPerPage,
    offset: currentPage * itemsPerPage
  }, {
    skip: !subcategoryId // Пропускаем запрос, если ID категории не найден
  });

  // Преобразуем данные категорий в массив для отображения информации
  const allCategories = Array.isArray(categoriesData) 
    ? categoriesData 
    : Array.isArray(categoriesData?.data) 
      ? categoriesData.data 
      : Array.isArray(categoriesData?.results) 
        ? categoriesData.results 
        : [];
  
  // Обрабатываем разные форматы данных API
  const { safeProductsData, totalCount } = React.useMemo(() => {
    let products = [];
    let count = 0;
    
    if (Array.isArray(productsData)) {
      products = productsData;
      count = productsData.length;
    } else if (productsData?.results && Array.isArray(productsData.results)) {
      products = productsData.results;
      count = productsData.count || productsData.results.length;
    } else if (productsData?.data && Array.isArray(productsData.data)) {
      products = productsData.data;
      count = productsData.count || productsData.data.length;
    }
    
    return { safeProductsData: products, totalCount: count };
  }, [productsData]);

  // Отладочная информация для категорий и товаров
  useEffect(() => {
    if (mounted && !productsLoading && !catLoading) {
      console.log('Slug:', subcategorySlug);
      console.log('Category ID:', subcategoryId);
      console.log('Products data:', productsData);
      console.log('Current page products:', safeProductsData);
    }
  }, [mounted, productsLoading, catLoading, subcategorySlug, subcategoryId, productsData, safeProductsData]);
  
  // Расчет пагинации на основе данных с сервера
  const pageCount = Math.ceil(totalCount / itemsPerPage);
  
  // Используем товары текущей страницы, полученные с сервера
  const currentProducts = safeProductsData;
  
  // Обработка изменения страницы
  const handlePageClick = (event) => {
    setCurrentPage(event.selected);
    // При изменении страницы прокручиваем страницу вверх
    window.scrollTo(0, 0);
  };

  // Получаем название подкатегории
  const getSubcategoryName = () => {
    // Сначала ищем категорию по ID
    if (subcategoryId) {
      const category = allCategories.find(cat => 
        String(cat.id) === String(subcategoryId) || 
        String(cat.id_remonline) === String(subcategoryId)
      );
      if (category?.name) return category.name;
    }
    
    // Если не нашли по ID, используем маппинг slug на названия
    const slugToNameMap = {
      'connectors': 'Коннекторы',
      'mounts': 'Крепления',
      'resistors': 'Обманки ( Резисторы )',
      'airbags': 'Парашюты ( Мешки )',
      'belt-parts': 'Запчасти для Ремней',
      'pyro-belts': 'ПП в Ремни',
      'pyro-seats': 'ПП в Ноги/Сиденье',
      'pyro-curtains': 'ПП в Шторы',
      'pyro-steering': 'ПП в Руль (2 запала)',
      'pyro-dashboard': 'ПП в Панель (2 запала)',
      'covers': 'Covers'
    };
    
    return slugToNameMap[subcategorySlug] || subcategorySlug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  // Получаем описание подкатегории
  const getSubcategoryDescription = () => {
    const slugToDescKey = {
      'connectors': 'connectors_seo_description',
      'mounts': 'mounts_seo_description',
      'resistors': 'resistors_seo_description',
      'airbags': 'airbags_seo_description',
      'belt-parts': 'belt_parts_seo_description',
      'pyro-belts': 'pyro_belts_seo_description',
      'pyro-seats': 'pyro_seats_seo_description',
      'pyro-curtains': 'pyro_curtains_seo_description',
      'pyro-steering': 'pyro_steering_seo_description',
      'pyro-dashboard': 'pyro_dashboard_seo_description',
      'covers': 'covers_seo_description'
    };
    
    if (slugToDescKey[subcategorySlug]) {
      try {
        return tCategories(slugToDescKey[subcategorySlug]);
      } catch (error) {
        return '';
      }
    }
    
    return '';
  };

  return (
    <section className="tp-product-area pb-90">
      <div className="container">
        <div className="row">
          <div className="col-xl-12">
            <div className="tp-section-title-wrapper-2 mb-40 pt-40">
             
              <p className="text-muted">{getSubcategoryDescription()}</p>
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
                      <div className="col-12">
                        <ErrorMsg msg={tProducts('noProductsFound')} />
                        <div className="mt-4 text-center">
                          <p className="text-muted">Отладочная информация:</p>
                          <p className="text-muted">Slug: {subcategorySlug}</p>
                          <p className="text-muted">Категория ID: {subcategoryId || 'не найден'}</p>
                          <p className="text-muted">Всего товаров в категории: {totalCount}</p>
                        </div>
                      </div>
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

export default ShopSubcategoryArea;
