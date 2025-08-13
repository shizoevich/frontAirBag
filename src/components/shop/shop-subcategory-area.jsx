'use client';
import React, { useState, useEffect } from "react";
import ProductItem from "../products/electronics/product-item";
import ErrorMsg from "@/components/common/error-msg";
import HomePrdLoader from "@/components/loader/home/home-prd-loader";
import { useGetShowCategoryQuery, useGetAllProductsQuery } from "@/redux/features/categoryApi";
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

  // Отладочная информация для категорий и товаров
  useEffect(() => {
    if (mounted && !productsLoading && !catLoading) {
      console.log('Slug:', subcategorySlug);
      console.log('All Categories:', allCategories);
      console.log('All Products:', safeProductsData);
    }
  }, [mounted, productsLoading, catLoading, subcategorySlug, allCategories, safeProductsData]);
  
  // Находим ID подкатегории по slug и имени
  const getSubcategoryIdBySlug = (slug) => {
    // Сначала проверяем по имени (более надежный способ)
    const categoryByName = allCategories.find(cat => {
      const catName = cat.name?.toLowerCase() || '';
      
      // Маппинг slug на возможные имена категорий
      const slugToNameMap = {
        'connectors': ['коннекторы', 'конектори', 'connectors', 'роз\'єми', 'Коннекторы'],
        'mounts': ['крепления', 'кріплення', 'mounts', 'Крепления'],
        'resistors': ['резисторы', 'резистори', 'обманки', 'resistors', 'Обманки ( Резисторы )'],
        'airbags': ['подушки', 'подушки безопасности', 'airbags', 'парашути', 'Парашюты ( Мешки )'],
        'belt-parts': ['запчасти ремней', 'запчастини ременів', 'belt parts', 'Запчасти для Ремней']
      };
      
      // Проверяем, соответствует ли имя категории одному из возможных имен для данного slug
      return slugToNameMap[slug]?.some(possibleName => 
        catName.includes(possibleName.toLowerCase())
      ) || false;
    });
    
    if (categoryByName) {
      console.log(`Found category by name for slug ${slug}:`, categoryByName);
      return categoryByName.id || categoryByName.id_remonline;
    }
    
    // Если не нашли по имени, используем жестко заданные ID из тестовых данных API
    const slugToIdMap = {
      'connectors': 753917, // ID для "Коннекторы"
      'mounts': 753918, // ID для "Крепления"
      'resistors': 753919, // ID для "Обманки ( Резисторы )"
      'airbags': 753897, // ID для "Парашюты ( Мешки )"
      'belt-parts': 753899 // ID для "Запчасти для Ремней"
    };
    
    const hardcodedId = slugToIdMap[slug] || null;
    console.log(`Using hardcoded ID for slug ${slug}:`, hardcodedId);
    return hardcodedId;
  };
  
  // Получаем ID подкатегории по slug
  const subcategoryId = getSubcategoryIdBySlug(subcategorySlug);
  console.log('Selected subcategoryId:', subcategoryId);
  
  // Фильтруем товары по выбранной подкатегории или по имени категории
  const filteredProducts = subcategorySlug 
    ? safeProductsData.filter(product => {
        // Проверяем все возможные форматы ID категории
        const productCategoryId = product.category?.id_remonline || product.category?.id || product.category_id;
        const productCategoryName = product.category?.name || '';
        
        // Если у нас есть ID подкатегории, фильтруем по нему
        if (subcategoryId && productCategoryId) {
          // Находим категорию товара
          const productCategory = allCategories.find(cat => 
            String(cat.id) === String(productCategoryId) || 
            String(cat.id_remonline) === String(productCategoryId)
          );
          
          if (productCategory) {
            // Проверяем, принадлежит ли товар к выбранной подкатегории или её подкатегориям
            const matchesById = String(productCategory.id) === String(subcategoryId) || 
                               String(productCategory.parent_id) === String(subcategoryId);
            
            if (matchesById) return true;
          }
        }
        
        // Если не нашли по ID, пробуем фильтровать по имени категории
        const slugToNameMap = {
          'connectors': ['коннекторы', 'конектори', 'connectors', 'роз\'єми', 'Коннекторы'],
          'mounts': ['крепления', 'кріплення', 'mounts', 'Крепления'],
          'resistors': ['резисторы', 'резистори', 'обманки', 'resistors', 'Обманки ( Резисторы )'],
          'airbags': ['подушки', 'подушки безопасности', 'airbags', 'парашути', 'Парашюты ( Мешки )'],
          'belt-parts': ['запчасти ремней', 'запчастини ременів', 'belt parts', 'Запчасти для Ремней']
        };
        
        const possibleNames = slugToNameMap[subcategorySlug] || [];
        const matchesByName = possibleNames.some(name => 
          productCategoryName.toLowerCase().includes(name.toLowerCase())
        );
        
        return matchesByName;
      })
    : safeProductsData;
    
  console.log('Filtered Products:', filteredProducts);
  
  // Расчет пагинации
  const pageCount = Math.ceil(filteredProducts.length / itemsPerPage);
  const offset = currentPage * itemsPerPage;
  const currentProducts = filteredProducts.slice(offset, offset + itemsPerPage);
  
  // Обработка изменения страницы
  const handlePageClick = (event) => {
    setCurrentPage(event.selected);
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
    
    // Если не нашли по ID, ищем по slug
    const slugToNameMap = {
      'connectors': 'Коннекторы',
      'mounts': 'Крепления',
      'resistors': 'Обманки ( Резисторы )',
      'airbags': 'Парашюты ( Мешки )',
      'belt-parts': 'Запчасти для Ремней'
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
      'belt-parts': 'belt_parts_seo_description'
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
            <div className="tp-section-title-wrapper-2 mb-40">
              <h3 className="tp-section-title-2">{getSubcategoryName()}</h3>
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
                          <p className="text-muted">Всего товаров: {safeProductsData.length}</p>
                          <p className="text-muted">Всего категорий: {allCategories.length}</p>
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
