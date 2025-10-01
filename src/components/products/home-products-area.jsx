'use client';
import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import ReactPaginate from 'react-paginate';
import ProductItem from './electronics/product-item';
import ParentCategories from '@/components/categories/parent-categories';
import CategoryCarousel from '@/components/categories/category-carousel';
import HomePrdLoader from '@/components/loader/home/home-prd-loader';
import ErrorMsg from '@/components/common/error-msg';
import ShapeLine from '@/svg/shape-line';
import { useGetAllProductsQuery } from '@/redux/features/productsApi';
import { useGetShowCategoryQuery } from '@/redux/features/categoryApi';

const HomeProductsArea = () => {
  const t = useTranslations('AllProductsArea');
  const tPagination = useTranslations('SearchArea');
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedParentCategory, setSelectedParentCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const itemsPerPage = 12;

  // Determine the active category ID for filtering
  const activeCategoryId = selectedSubcategory || selectedParentCategory;

  // Fetch categories
  const { data: categoriesData, isLoading: catLoading, isError: catError } = useGetShowCategoryQuery();
  
  // Fetch products with server-side filtering and pagination
  const { data: productsData, isLoading: productsLoading, isError: productsError } = useGetAllProductsQuery({
    limit: itemsPerPage,
    offset: currentPage * itemsPerPage,
    categoryId: activeCategoryId,
  });

  // Process categories
  const allCategories = React.useMemo(() => 
    Array.isArray(categoriesData) ? categoriesData :
    Array.isArray(categoriesData?.data) ? categoriesData.data :
    Array.isArray(categoriesData?.results) ? categoriesData.results : [], 
  [categoriesData]);

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
    document.getElementById('home-products-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Handle parent category selection (local state, no navigation)
  const handleParentCategoryChange = (category) => {
    const categoryId = category.id === 'all' ? null : Number(category.id);
    setSelectedParentCategory(categoryId);
    setSelectedSubcategory(null);
    setCurrentPage(0);
  };

  // Handle subcategory selection (local state, no navigation)
  const handleSubcategoryChange = (category) => {
    const categoryId = Number(category.id);
    setSelectedSubcategory(categoryId === selectedSubcategory ? null : categoryId);
    setCurrentPage(0);
  };

  // Products content
  let content = null;
  if (productsLoading) {
    content = <HomePrdLoader loading />;
  } else if (productsError) {
    content = <ErrorMsg msg={t('loadingError')} />;
  } else if (products.length === 0) {
    content = <ErrorMsg msg={t('noProductsFound')} />;
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
                </h3>
              </div>
            </div>
          </div>
        </div>
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

export default HomeProductsArea;
