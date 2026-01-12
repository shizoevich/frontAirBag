'use client';
import React, { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import ReactPaginate from 'react-paginate';
import ProductItem from './electronics/product-item';
import ParentCategories from '@/components/categories/parent-categories';
import CategoryCarousel from '@/components/categories/category-carousel';
import HomePrdLoader from '@/components/loader/home/home-prd-loader';
import ErrorMsg from '@/components/common/error-msg';
import ShapeLine from '@/svg/shape-line';
import { useGetAllProductsQuery } from '@/redux/features/productsApi';
import { useGetCategoryTreeQuery } from '@/redux/features/categoryApi';
import { getChildrenAtLevel, hasChildren, sortAlphabetically } from '@/utils/categoryTreeHelpers';

const HomeProductsArea = () => {
  const t = useTranslations('AllProductsArea');
  const tPagination = useTranslations('SearchArea');
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedPath, setSelectedPath] = useState([]); // Массив ID выбранных категорий [level0, level1, level2, ...]
  const itemsPerPage = 12;

  // Получаем ID активной категории (последняя в пути)
  const activeCategoryId = selectedPath.length > 0 ? selectedPath[selectedPath.length - 1] : null;

  // Загружаем дерево категорий
  const { data: categoryTree, isLoading: catLoading, isError: catError } = useGetCategoryTreeQuery();
  
  // Загружаем товары с серверной фильтрацией и пагинацией
  const { data: productsData, isLoading: productsLoading, isError: productsError } = useGetAllProductsQuery({
    limit: itemsPerPage,
    offset: currentPage * itemsPerPage,
    categoryId: activeCategoryId,
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
    document.getElementById('home-products-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Обработка выбора категории на любом уровне
  const handleCategorySelect = (category, level) => {
    if (!category || !category.id) {
      // Сброс до определенного уровня
      setSelectedPath(selectedPath.slice(0, level));
    } else {
      // Обновляем путь: обрезаем до текущего уровня и добавляем новую категорию
      const newPath = [...selectedPath.slice(0, level), category.id];
      setSelectedPath(newPath);
    }
    setCurrentPage(0);
  };

  // Определяем количество уровней для отображения (начиная со 2-го уровня, т.к. 1-й это кнопки)
  const carouselLevelsToShow = useMemo(() => {
    if (!categoryTree || selectedPath.length === 0) return 0;
    
    let levels = 1; // Показываем детей первого выбранного уровня
    
    // Проверяем каждый уровень пути начиная с первого
    for (let i = 0; i < selectedPath.length; i++) {
      const categoryId = selectedPath[i];
      if (hasChildren(categoryTree, categoryId)) {
        levels = i + 2; // +2 потому что показываем детей следующего уровня
      } else {
        break;
      }
    }
    
    return levels - 1; // -1 потому что первый уровень это кнопки
  }, [categoryTree, selectedPath]);

  // Получаем категории первого уровня для кнопок
  const firstLevelCategories = useMemo(() => {
    if (!categoryTree) return [];
    return sortAlphabetically(categoryTree);
  }, [categoryTree]);

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
    <section id="home-products-section" className="tp-product-area pb-55">
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

        {/* Остальные уровни - карусели (начиная со 2-го уровня) */}
        {Array.from({ length: carouselLevelsToShow }).map((_, index) => {
          const level = index + 1; // +1 потому что первый уровень это кнопки
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
        
        {/* Заголовок секции */}
        <div className="row">
          <div className="col-12">
            <div className="tp-section-title-wrapper mb-40">
              <h3 className="tp-section-title">
                {t('ourProducts') || 'Наші товари'}
                <ShapeLine />
              </h3>
            </div>
          </div>
        </div>

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

export default HomeProductsArea;