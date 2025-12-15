'use client';
import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import ReactPaginate from 'react-paginate';
import ProductItem from './electronics/product-item';
import HomePrdLoader from '@/components/loader/home/home-prd-loader';
import ErrorMsg from '@/components/common/error-msg';
import ShapeLine from '@/svg/shape-line';
import { useGetAllProductsQuery } from '@/redux/features/productsApi';

const SearchProductsArea = () => {
  const t = useTranslations('SearchArea');
  const tPagination = useTranslations('SearchArea');
  const searchParams = useSearchParams();
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 12;

  // Get search text from URL
  const searchText = searchParams.get('searchText') || '';

  // Fetch products with search filter and pagination
  const { data: productsData, isLoading: productsLoading, isError: productsError } = useGetAllProductsQuery({
    limit: itemsPerPage,
    offset: currentPage * itemsPerPage,
    searchText: searchText,
  });

  // Process products
  const { products, totalCount } = React.useMemo(() => {
    if (!productsData) return { products: [], totalCount: 0 };
    const results = productsData.results || productsData.data || productsData || [];
    const count = productsData.count || results.length;
    return { products: results, totalCount: count };
  }, [productsData]);

  const pageCount = Math.ceil(totalCount / itemsPerPage);

  // Handle page change
  const handlePageClick = (event) => {
    setCurrentPage(event.selected);
    document.getElementById('search-products-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Products content
  let content = null;
  if (productsLoading) {
    content = <HomePrdLoader loading />;
  } else if (productsError) {
    content = <ErrorMsg msg={t('loadingError')} />;
  } else if (products.length === 0) {
    content = (
      <div className="col-12">
        <div className="text-center py-5">
          <h3>{t('noProductsFound')}</h3>
          {searchText && (
            <p className="text-muted">
              {t('searchResultsFor')}: &quot;<strong>{searchText}</strong>&quot;
            </p>
          )}
        </div>
      </div>
    );
  } else {
    content = products.map((product) => (
      <div key={product.id} className="col-xl-3 col-lg-3 col-sm-6">
        <ProductItem product={product} />
      </div>
    ));
  }

  return (
    <section id="search-products-section" className="tp-product-area pb-55 pt-55">
      <div className="container">
        {searchText && (
          <div className="row mb-4">
            <div className="col-12">
              <div className="tp-section-title-wrapper">
                <h3 className="tp-section-title">
                  {t('searchResults')}: &quot;{searchText}&quot;
                </h3>
                {!productsLoading && (
                  <p className="text-muted">
                    {t('productsFound')}: {totalCount}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
        
        <div className="row">{content}</div>
        
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

export default SearchProductsArea;
