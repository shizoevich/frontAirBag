'use client';
import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import ReactPaginate from 'react-paginate';
import ProductItem from './electronics/product-item';
import HomePrdLoader from '@/components/loader/home/home-prd-loader';
import ErrorMsg from '@/components/common/error-msg';
import ShapeLine from '@/svg/shape-line';
import { useGetAllProductsQuery } from '@/redux/features/productsApi';
import { useGetShowCategoryQuery } from '@/redux/features/categoryApi';

const CategoryProductsArea = () => {
  const t = useTranslations('AllProductsArea');
  const tPagination = useTranslations('SearchArea');
  const params = useParams();
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 12;

  // Get slug from URL params
  const slug = params?.slug || '';
  
  // Extract category ID from slug (format: "category-name-123")
  // The ID is always the last part after the last dash, and it should be a number
  let categoryId = null;
  if (slug) {
    const parts = slug.split('-');
    const lastPart = parts[parts.length - 1];
    // Check if the last part is a number
    if (!isNaN(lastPart) && lastPart !== '') {
      categoryId = lastPart;
    } else {
      // If slug doesn't have ID at the end, try to find category by slug/title
      // For now, we'll just use null and let the API handle it
      console.warn('Category slug does not contain a valid ID:', slug);
    }
  }

  // Fetch categories to get category name
  const { data: categoriesData } = useGetShowCategoryQuery();
  
  // Debug logging
  console.log('CategoryProductsArea - slug:', slug);
  console.log('CategoryProductsArea - extracted categoryId:', categoryId);
  
  // Fetch products filtered by category
  const { data: productsData, isLoading: productsLoading, isError: productsError } = useGetAllProductsQuery({
    limit: itemsPerPage,
    offset: currentPage * itemsPerPage,
    categoryId: categoryId,
  });

  // Find current category name
  const allCategories = React.useMemo(() => 
    Array.isArray(categoriesData) ? categoriesData :
    Array.isArray(categoriesData?.data) ? categoriesData.data :
    Array.isArray(categoriesData?.results) ? categoriesData.results : [], 
  [categoriesData]);

  const currentCategory = allCategories.find(cat => 
    String(cat.id) === String(categoryId) || 
    String(cat.id_remonline) === String(categoryId)
  );

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
    document.getElementById('category-products-section')?.scrollIntoView({ behavior: 'smooth' });
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
    <section id="category-products-section" className="tp-product-area pb-55 pt-55">
      <div className="container">
        {currentCategory && (
          <div className="row mb-4">
            <div className="col-12">
              <div className="tp-section-title-wrapper">
                <h3 className="tp-section-title">
                  {currentCategory.title}
                  
                </h3>
                {!productsLoading && totalCount > 0 && (
                  <p className="text-muted">
                    {t('showing')} {totalCount} {t('products')}
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

export default CategoryProductsArea;
