'use client';
import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import ProductItem from "./electronics/product-item";
import ErrorMsg from "@/components/common/error-msg";
import HomePrdLoader from "@/components/loader/home/home-prd-loader";
import { useGetCategoryTreeQuery } from '@/redux/features/categoryApi';
import { useGetAllProductsQuery } from "@/redux/features/productsApi";
import ReactPaginate from 'react-paginate';
import CategoryCarousel from "@/components/categories/category-carousel";
import ParentCategories from "@/components/categories/parent-categories";
import { getChildrenAtLevel, hasChildren, sortAlphabetically, getCategoryFromTree, getCategoryPath } from '@/utils/categoryTreeHelpers';

const AllProductsArea = () => {
  const t = useTranslations('AllProductsArea');
  const tPagination = useTranslations('SearchArea');
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedPath, setSelectedPath] = useState([]); // Массив ID выбранных категорий
  const itemsPerPage = 12;

  // Загружаем дерево категорий
  const { data: categoryTree, isLoading: catLoading, isError: catError } = useGetCategoryTreeQuery();
  
  // Получаем categoryId из URL
  const urlCategoryId = searchParams.get('category');
  const searchText = searchParams.get('searchText') || '';

    // Инициализация selectedPath из URL при загрузке
    useEffect(() => {
      if (urlCategoryId && categoryTree) {
        const categoryId = Number(urlCategoryId);
        // Получаем путь от корня до этой категории
        const path = getCategoryPath(categoryTree, categoryId);
        if (path) {
          setSelectedPath(path.map(cat => cat.id));
        } else {
          // Если путь не найден, просто устанавливаем ID
          setSelectedPath([categoryId]);
        }
      } else if (!urlCategoryId) {
        // Если нет категории в URL, сбрасываем путь
        setSelectedPath([]);
      }
    }, [urlCategoryId, categoryTree]);

  // Получаем ID активной категории (последняя в пути)
  const activeCategoryId = selectedPath.length > 0 ? selectedPath[selectedPath.length - 1] : null;
  
  // Загружаем товары с серверной фильтрацией и пагинацией
  const { data: productsData, isLoading: productsLoading, isError: productsError } = useGetAllProductsQuery({
    limit: itemsPerPage,
    offset: currentPage * itemsPerPage,
    categoryId: activeCategoryId,
    searchText: searchText,
  });

  // Обрабатываем товары
  const { products, totalCount } = useMemo(() => {
    if (!productsData) return { products: [], totalCount: 0 };
    const results = productsData.results || productsData.data || productsData || [];
    const count = productsData.count || results.length;
    return { products: results, totalCount: count };
  }, [productsData]);

  const pageCount = Math.ceil(totalCount / itemsPerPage);

  // Обработка смены страницы
  const handlePageClick = (event) => {
    setCurrentPage(event.selected);
    document.getElementById('all-products-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Обработка выбора категории на любом уровне
  const handleCategorySelect = (category, level) => {
    if (!category || !category.id) {
      setSelectedPath(selectedPath.slice(0, level));
    } else {
      const newPath = [...selectedPath.slice(0, level), category.id];
      setSelectedPath(newPath);
      // Обновляем URL
      router.push(`/${locale}/shop?category=${category.id}`);
    }
    setCurrentPage(0);
  };

  // Определяем количество уровней для отображения (начиная со 2-го уровня)
  const carouselLevelsToShow = useMemo(() => {
    if (!categoryTree || selectedPath.length === 0) return 0;
    
    let levels = 1;
    
    for (let i = 0; i < selectedPath.length; i++) {
      const categoryId = selectedPath[i];
      if (hasChildren(categoryTree, categoryId)) {
        levels = i + 2;
      } else {
        break;
      }
    }
    
    return levels - 1;
  }, [categoryTree, selectedPath]);

  // Получаем категории первого уровня для кнопок
  const firstLevelCategories = useMemo(() => {
    if (!categoryTree) return [];
    return sortAlphabetically(categoryTree);
  }, [categoryTree]);

  // Получаем хлебные крошки выбранных категорий
  const breadcrumbs = useMemo(() => {
    if (!categoryTree || selectedPath.length === 0) return [];
    
    return selectedPath.map(categoryId => {
      const category = getCategoryFromTree(categoryTree, categoryId);
      return category ? category.title : '';
    }).filter(Boolean);
  }, [categoryTree, selectedPath]);

  // Контент товаров
  let content = null;
  if (productsLoading) {
    content = <HomePrdLoader loading />;
  } else if (productsError) {
    content = <ErrorMsg msg={t('loadingError') || 'Ошибка загрузки'} />;
  } else if (products.length === 0) {
    content = <ErrorMsg msg={t('noProductsFound') || 'Товары не найдены'} />;
  } else {
    content = products.map((product) => (
      <div key={product.id} className="col-xl-3 col-lg-3 col-sm-6">
        <ProductItem product={product} />
      </div>
    ));
  }

  return (
    <section id="all-products-section" className="tp-product-area pb-55">
      <div className="container">
        {/* Первый уровень - кнопки */}
        <div className="row">
          <div className="col-12">
            <ParentCategories
              categories={firstLevelCategories}
              isLoading={catLoading}
              isError={catError}
              selectedCategory={selectedPath[0] || null}
              onCategorySelect={(category) => handleCategorySelect(category, 0)}
            />
          </div>
        </div>

        {/* Остальные уровни - карусели */}
        {Array.from({ length: carouselLevelsToShow }).map((_, index) => {
          const level = index + 1;
          const categories = getChildrenAtLevel(categoryTree, selectedPath, level);
          const selectedCategoryId = selectedPath[level] || null;
          
          if (categories.length === 0) return null;
          
          return (
            <div key={level} className="row">
              <div className="col-12">
                <div className="tp-product-tab mb-45 tp-tab">
                  <CategoryCarousel
                    categories={categories}
                    isLoading={catLoading}
                    isError={catError}
                    selectedCategory={selectedCategoryId}
                    onCategorySelect={(category) => handleCategorySelect(category, level)}
                    level={level}
                  />
                </div>
              </div>
            </div>
          );
        })}
        
        {/* Хлебные крошки вместо заголовка */}
        {breadcrumbs.length > 0 && (
          <div className="row">
            <div className="col-12">
              <div className="tp-section-title-wrapper mb-40">
                <div className="category-breadcrumbs" style={{ 
                  display: 'flex', 
                  alignItems: 'baseline',
                  gap: '8px',
                  flexWrap: 'wrap'
                }}>
                  {breadcrumbs.map((crumb, index) => (
                    <React.Fragment key={index}>
                      <span style={{
                        fontSize: index === 0 ? '24px' : index === 1 ? '18px' : '18px',
                        fontWeight: index === 0 ? '600' : index === 1 ? '400' : '400',
                        color: index === 0 ? '#222' : index === 1 ? '#444' : '#444',
                        lineHeight: '1.2'
                      }}>
                        {crumb}
                      </span>
                      {index < breadcrumbs.length - 1 && (
                        <span style={{ 
                          fontSize: '24px', 
                          color: '#999',
                          margin: '0 4px'
                        }}>
                          /
                        </span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Товары */}
        <div className="row">{content}</div>
        
        {/* Пагинация */}
        {pageCount > 1 && (
          <div className="row">
            <div className="col-xl-12">
              <div className="tp-pagination mt-35">
                <ReactPaginate
                  breakLabel={tPagination('breakLabel') || '...'}
                  nextLabel={tPagination('nextPage') || 'Далее'}
                  onPageChange={handlePageClick}
                  pageRangeDisplayed={3}
                  pageCount={pageCount}
                  previousLabel={tPagination('previousPage') || 'Назад'}
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