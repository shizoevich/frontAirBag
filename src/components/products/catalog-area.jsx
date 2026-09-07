'use client';
import React, { useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import ReactPaginate from 'react-paginate';
import ProductItem from './electronics/product-item';
import ParentCategories from '@/components/categories/parent-categories';
import CategoryCarousel from '@/components/categories/category-carousel';
import HomePrdLoader from '@/components/loader/home/home-prd-loader';
import ErrorMsg from '@/components/common/error-msg';
import ProductsFilterBar from '@/components/products/products-filter-bar';
import { useGetAllProductsQuery } from '@/redux/features/productsApi';
import { useGetCategoryTreeQuery } from '@/redux/features/categoryApi';
import { categoryPath } from '@/utils/category-link';
import {
  getChildrenAtLevel,
  hasChildren,
  sortRootCategories,
  getCategoryFromTree,
  getCategoryPath,
} from '@/utils/categoryTreeHelpers';

const ITEMS_PER_PAGE = 12;

/**
 * The whole catalog: category levels, filters, product grid and pagination.
 *
 * One component serves the home page, `/category/<slug>-<id>` and `/search` so they can
 * never drift apart — picking a category in the rows below navigates to that category's
 * own URL, which renders this very same view. Category state therefore lives in the
 * path (never in a `?category=<id>` query), and filters/page live in the query so any
 * catalog state can be linked to and restored.
 *
 * A search query is one more filter, `?searchText=`, and not a separate page: entering
 * one used to replace the whole view with a bare product grid, so the shopper lost the
 * banner and every category row at once and had no way left to narrow the results.
 */
const CatalogArea = ({ activeCategoryId = null }) => {
  const t = useTranslations('AllProductsArea');
  const tSearch = useTranslations('SearchArea');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filters = useMemo(
    () => ({
      ordering: searchParams.get('ordering') || '',
      priceMin: searchParams.get('priceMin') || '',
      priceMax: searchParams.get('priceMax') || '',
      inStock: searchParams.get('inStock') === '1',
    }),
    [searchParams]
  );

  const currentPage = Math.max(0, Number(searchParams.get('page') || '0'));
  const searchText = searchParams.get('searchText') || '';

  const { data: categoryTree, isLoading: catLoading, isError: catError } = useGetCategoryTreeQuery();

  // Path of ancestors down to the active category, so every level above it stays
  // expanded no matter whether the user clicked through or landed on the URL directly.
  const selectedPath = useMemo(() => {
    if (!activeCategoryId) return [];
    const path = getCategoryPath(categoryTree, activeCategoryId);
    return path?.length ? path.map((cat) => cat.id) : [activeCategoryId];
  }, [categoryTree, activeCategoryId]);

  const { data: productsData, isLoading, isError } = useGetAllProductsQuery({
    limit: ITEMS_PER_PAGE,
    offset: currentPage * ITEMS_PER_PAGE,
    categoryId: activeCategoryId,
    searchText,
    ordering: filters.ordering,
    priceMin: filters.priceMin,
    priceMax: filters.priceMax,
    inStock: filters.inStock,
  });

  const { products, totalCount } = useMemo(() => {
    if (!productsData) return { products: [], totalCount: 0 };
    const results = productsData.results || productsData.data || productsData || [];
    const count = productsData.count ?? results.length;
    return { products: results, totalCount: count };
  }, [productsData]);

  const pageCount = Math.ceil(totalCount / ITEMS_PER_PAGE);

  // Filters survive a category change, so `?ordering=…` is rebuilt from the current
  // query rather than dropped; `page` never does — page 3 of one category is
  // meaningless in another.
  const queryString = (overrides = {}) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(overrides).forEach(([key, value]) => {
      if (value === '' || value === null || value === undefined || value === false) {
        params.delete(key);
      } else {
        params.set(key, value === true ? '1' : String(value));
      }
    });
    const qs = params.toString();
    return qs ? `?${qs}` : '';
  };

  const handleFilterChange = (changed) => {
    router.replace(`${pathname}${queryString({ ...changed, page: '' })}`, { scroll: false });
  };

  const handleReset = () => {
    router.replace(
      `${pathname}${queryString({ ordering: '', priceMin: '', priceMax: '', inStock: false, page: '' })}`,
      { scroll: false }
    );
  };

  // Сброс запроса уводит с `/search` на витрину: страница поиска без запроса — это
  // тот же полный каталог, но по адресу, который ничего о себе не говорит. Внутри
  // категории остаёмся в ней, снимая только запрос.
  const handleClearSearch = () => {
    const base = activeCategoryId ? pathname : `/${locale}`;
    router.push(`${base}${queryString({ searchText: '', page: '' })}`);
  };

  const handlePageClick = (event) => {
    router.replace(`${pathname}${queryString({ page: event.selected || '' })}`, { scroll: false });
    document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Clicking the selected category again steps one level up (to the parent category,
  // or to the full catalog from the top level).
  const handleCategorySelect = (category, level) => {
    const isToggleOff = !category?.id || selectedPath[level] === category.id;
    const target = isToggleOff
      ? (level > 0 ? getCategoryFromTree(categoryTree, selectedPath[level - 1]) : null)
      : category;

    const base = target ? `/${locale}${categoryPath(target)}` : `/${locale}`;
    router.push(`${base}${queryString({ page: '' })}`);
  };

  const carouselLevelsToShow = useMemo(() => {
    if (!categoryTree || selectedPath.length === 0) return 0;

    let levels = 1; // children of the first selected level

    for (let i = 0; i < selectedPath.length; i++) {
      if (hasChildren(categoryTree, selectedPath[i])) {
        levels = i + 2;
      } else {
        break;
      }
    }

    return levels - 1; // the first level is rendered as buttons, not a carousel
  }, [categoryTree, selectedPath]);

  const firstLevelCategories = useMemo(
    () => (categoryTree ? sortRootCategories(categoryTree) : []),
    [categoryTree]
  );

  // Ancestors stay clickable so a deep category is not a dead end.
  const breadcrumbs = useMemo(() => {
    if (!categoryTree || selectedPath.length === 0) return [];

    return selectedPath
      .map((categoryId) => getCategoryFromTree(categoryTree, categoryId))
      .filter(Boolean)
      .map((category) => ({ title: category.title, href: `/${locale}${categoryPath(category)}` }));
  }, [categoryTree, selectedPath, locale]);

  let content = null;
  if (isLoading) {
    content = <HomePrdLoader loading />;
  } else if (isError) {
    content = <ErrorMsg msg={t('loadingError') || 'Ошибка загрузки'} />;
  } else if (products.length === 0) {
    // По пустому поиску говорим, чего именно не нашли: иначе на странице с
    // непустым запросом стоит безличное «товары не найдены».
    content = (
      <ErrorMsg
        msg={
          searchText
            ? tSearch('noResults', { searchText })
            : t('noProductsFound') || 'Товары не найдены'
        }
      />
    );
  } else {
    content = products.map((product) => (
      <div key={product.id} className="col-xl-3 col-lg-3 col-sm-6">
        <ProductItem product={product} />
      </div>
    ));
  }

  return (
    <section id="catalog-section" className="tp-product-area pb-55">
      <div className="container">
        {/* Первый уровень — кнопки */}
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

        {/* Остальные уровни — карусели */}
        {Array.from({ length: carouselLevelsToShow }).map((_, index) => {
          const level = index + 1;
          const categories = getChildrenAtLevel(categoryTree, selectedPath, level);

          if (categories.length === 0) return null;

          return (
            <div key={level} className="row">
              <div className="col-12">
                <div className="tp-product-tab mb-45 mt-20 tp-tab">
                  <CategoryCarousel
                    categories={categories}
                    isLoading={catLoading}
                    isError={catError}
                    selectedCategory={selectedPath[level] || null}
                    onCategorySelect={(category) => handleCategorySelect(category, level)}
                    level={level}
                  />
                </div>
              </div>
            </div>
          );
        })}

        {/* Панель фильтров */}
        <div className="row">
          <div className="col-12">
            <ProductsFilterBar
              filters={filters}
              onFilterChange={handleFilterChange}
              onReset={handleReset}
            />
          </div>
        </div>

        {/* Хлебные крошки вместо заголовка */}
        {breadcrumbs.length > 0 && (
          <div className="row">
            <div className="col-12">
              <div className="tp-section-title-wrapper mb-40">
                <div
                  className="category-breadcrumbs"
                  style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}
                >
                  {breadcrumbs.map((crumb, index) => {
                    const isLast = index === breadcrumbs.length - 1;
                    const style = {
                      fontSize: index === 0 ? '24px' : '18px',
                      fontWeight: index === 0 ? '600' : '400',
                      color: index === 0 ? '#222' : '#444',
                      lineHeight: '1.2',
                    };

                    return (
                      <React.Fragment key={crumb.href}>
                        {isLast ? (
                          <h1 style={{ ...style, margin: 0 }}>{crumb.title}</h1>
                        ) : (
                          <Link href={crumb.href} style={style}>
                            {crumb.title}
                          </Link>
                        )}
                        {!isLast && (
                          <span style={{ fontSize: '24px', color: '#999', margin: '0 4px' }}>/</span>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Запрос и способ его снять */}
        {searchText && (
          <div className="row">
            <div className="col-12">
              <div className="tp-section-title-wrapper mb-40">
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', flexWrap: 'wrap' }}>
                  {/* Заголовком страницы служат хлебные крошки, когда выбрана
                      категория, — тогда запрос идёт подписью, а не вторым h1. */}
                  {React.createElement(
                    breadcrumbs.length > 0 ? 'p' : 'h1',
                    {
                      style: {
                        margin: 0,
                        fontSize: breadcrumbs.length > 0 ? '18px' : '24px',
                        fontWeight: breadcrumbs.length > 0 ? '400' : '600',
                        color: breadcrumbs.length > 0 ? '#444' : '#222',
                        lineHeight: '1.2',
                      },
                    },
                    `${tSearch('searchResults')}: «${searchText}»`
                  )}
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      fontSize: '14px',
                      color: '#de8043',
                      textDecoration: 'underline',
                      cursor: 'pointer',
                    }}
                  >
                    {tSearch('clearSearch')}
                  </button>
                </div>
                {!isLoading && (
                  <p className="text-muted" style={{ margin: '6px 0 0' }}>
                    {tSearch('productsFound')}: {totalCount}
                  </p>
                )}
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
                  breakLabel={tSearch('breakLabel') || '...'}
                  nextLabel={tSearch('nextPage') || 'Далее'}
                  onPageChange={handlePageClick}
                  pageRangeDisplayed={3}
                  pageCount={pageCount}
                  previousLabel={tSearch('previousPage') || 'Назад'}
                  renderOnZeroPageCount={null}
                  forcePage={Math.min(currentPage, Math.max(pageCount - 1, 0))}
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

export default CatalogArea;
