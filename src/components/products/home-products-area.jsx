'use client';
import React, { useMemo } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import ReactPaginate from 'react-paginate';
import ProductItem from './electronics/product-item';
import ParentCategories from '@/components/categories/parent-categories';
import CategoryCarousel from '@/components/categories/category-carousel';
import HomePrdLoader from '@/components/loader/home/home-prd-loader';
import ErrorMsg from '@/components/common/error-msg';
import { useGetAllProductsQuery, useGetFeaturedProductsQuery } from '@/redux/features/productsApi';
import { useGetCategoryTreeQuery } from '@/redux/features/categoryApi';
import { getChildrenAtLevel, hasChildren, sortAlphabetically, getCategoryFromTree } from '@/utils/categoryTreeHelpers';

const HomeProductsArea = () => {
  const t = useTranslations('AllProductsArea');
  const tPagination = useTranslations('SearchArea');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const itemsPerPage = 12;

  // Состояние выбранных категорий и страницы — в URL
  const selectedPath = useMemo(() => {
    const cats = searchParams.get('cats');
    if (!cats) return [];
    return cats.split(',').map(Number).filter(Boolean);
  }, [searchParams]);

  const currentPage = Number(searchParams.get('page') || '0');

  // Получаем ID активной категории (последняя в пути)
  const activeCategoryId = selectedPath.length > 0 ? selectedPath[selectedPath.length - 1] : null;

  // Загружаем дерево категорий
  const { data: categoryTree, isLoading: catLoading, isError: catError } = useGetCategoryTreeQuery();

  const isFeatured = selectedPath.length === 0;

  const { data: featuredData, isLoading: featuredLoading, isError: featuredError } = useGetFeaturedProductsQuery(
    undefined,
    { skip: !isFeatured }
  );

  // Загружаем товары с серверной фильтрацией и пагинацией
  const { data: productsData, isLoading: productsLoading, isError: productsError } = useGetAllProductsQuery(
    { limit: itemsPerPage, offset: currentPage * itemsPerPage, categoryId: activeCategoryId },
    { skip: isFeatured }
  );

  // Обрабатываем товары
  const { products, totalCount } = useMemo(() => {
    if (isFeatured) {
      if (!featuredData) return { products: [], totalCount: 0 };
      const results = Array.isArray(featuredData) ? featuredData : (featuredData.results || featuredData.data || []);
      return { products: results, totalCount: results.length };
    }
    if (!productsData) return { products: [], totalCount: 0 };
    const results = productsData.results || productsData.data || productsData || [];
    const count = productsData.count || results.length;
    return { products: results, totalCount: count };
  }, [isFeatured, featuredData, productsData]);

  const pageCount = Math.ceil(totalCount / itemsPerPage);

  // Обработка смены страницы
  const handlePageClick = (event) => {
    const params = new URLSearchParams(searchParams.toString());
    if (event.selected === 0) {
      params.delete('page');
    } else {
      params.set('page', String(event.selected));
    }
    const qs = params.toString();
    router.replace(`${pathname}${qs ? `?${qs}` : ''}`, { scroll: false });
    document.getElementById('home-products-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Обработка выбора категории на любом уровне (повторный клик снимает фильтр)
  const handleCategorySelect = (category, level) => {
    const params = new URLSearchParams(searchParams.toString());

    const isToggleOff = !category || !category.id || selectedPath[level] === category.id;

    if (isToggleOff) {
      const newPath = selectedPath.slice(0, level);
      if (newPath.length === 0) {
        params.delete('cats');
      } else {
        params.set('cats', newPath.join(','));
      }
    } else {
      const newPath = [...selectedPath.slice(0, level), category.id];
      params.set('cats', newPath.join(','));
    }

    params.delete('page');
    const qs = params.toString();
    router.replace(`${pathname}${qs ? `?${qs}` : ''}`, { scroll: false });
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

  // Получаем хлебные крошки выбранных категорий
  const breadcrumbs = useMemo(() => {
    if (!categoryTree || selectedPath.length === 0) return [];

    return selectedPath.map(categoryId => {
      const category = getCategoryFromTree(categoryTree, categoryId);
      return category ? category.title : '';
    }).filter(Boolean);
  }, [categoryTree, selectedPath]);

  const isLoading = isFeatured ? featuredLoading : productsLoading;
  const isError = isFeatured ? featuredError : productsError;

  // Контент товаров
  let content = null;
  if (isLoading) {
    content = <HomePrdLoader loading />;
  } else if (isError) {
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
                <div className="tp-product-tab mb-45 mt-20 tp-tab">
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
                      fontSize: index === 0 ? '24px' : '18px',
                      fontWeight: index === 0 ? '600' : '400',
                      color: index === 0 ? '#222' : '#444',
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
