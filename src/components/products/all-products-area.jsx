'use client';
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShapeLine } from "@/svg";
import ProductItem from "./electronics/product-item";
import ErrorMsg from "@/components/common/error-msg";
import HomePrdLoader from "@/components/loader/home/home-prd-loader";
import { useGetShowCategoryQuery, useGetAllProductsQuery } from "@/redux/features/categoryApi";
import ReactPaginate from 'react-paginate';
import CategoryCarousel from "@/components/categories/category-carousel";

// Fallback image URL
const FALLBACK_IMAGE = 'https://t3.ftcdn.net/jpg/04/34/72/82/360_F_434728286_OWQQvAFoXZLdGHlObozsolNeuSxhpr84.jpg';

const AllProductsArea = () => {
  const [mounted, setMounted] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const itemsPerPage = 12; // Number of products per page
  
  useEffect(() => {
    setMounted(true);
  }, []);

  // Get categories for filter
  const {
    data: categoriesData,
    isLoading: catLoading,
    isError: catError
  } = useGetShowCategoryQuery();

  // Get all products
  const {
    data: productsData = [],
    isLoading: productsLoading,
    isError: productsError
  } = useGetAllProductsQuery();

  // Convert categories data to array
  const categories = Array.isArray(categoriesData) 
    ? categoriesData 
    : Array.isArray(categoriesData?.data) 
      ? categoriesData.data 
      : Array.isArray(categoriesData?.results) 
        ? categoriesData.results 
        : [];

  // Ensure productsData is always an array
  console.log('Raw productsData:', productsData);
  
  // Обрабатываем разные форматы данных API
  let safeProductsData = [];
  
  if (Array.isArray(productsData)) {
    safeProductsData = productsData;
  } else if (productsData?.results && Array.isArray(productsData.results)) {
    safeProductsData = productsData.results;
  } else if (productsData?.data && Array.isArray(productsData.data)) {
    safeProductsData = productsData.data;
  }
  
  console.log('Processed products data:', safeProductsData);

  // Filter products by selected category
  const filteredProducts = selectedCategory 
    ? safeProductsData.filter(product => {
        // Check all possible category ID formats
        const categoryId = product.category?.id_remonline || product.category?.id || product.category_id;
        
        // Log for debugging
        console.log('Product category ID:', categoryId, 'Selected category:', selectedCategory);
        
        // More robust comparison
        if (!categoryId && !selectedCategory) return true;
        if (!categoryId) return false;
        
        const productCategoryId = String(categoryId).trim();
        const selectedCategoryId = String(selectedCategory).trim();
        
        return productCategoryId === selectedCategoryId;
      })
    : safeProductsData;

  // Calculate pagination
  const pageCount = Math.ceil(filteredProducts.length / itemsPerPage);
  const offset = currentPage * itemsPerPage;
  const currentProducts = filteredProducts.slice(offset, offset + itemsPerPage);

  // Handle page change
  const handlePageClick = (event) => {
    setCurrentPage(event.selected);
    // Scroll to top of product section
    document.getElementById('all-products-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Handle category filter change
  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId === selectedCategory ? null : categoryId);
    setCurrentPage(0); // Reset to first page when changing category
  };

  if (!mounted) return null;

  // Products content
  let content = null;

  if (productsLoading) {
    content = <HomePrdLoader loading />;
  } else if (productsError) {
    content = <ErrorMsg msg="Ошибка загрузки товаров" />;
  } else if (!currentProducts || currentProducts.length === 0) {
    content = <ErrorMsg msg="Товары не найдены" />;
  } else {
    content = currentProducts.map((product) => {
      // Ensure product has an id
      const productId = product?.id || product?._id || Math.random().toString(36).substr(2, 9);
      return (
        <div key={productId} className="col-xl-3 col-lg-3 col-sm-6">
          <ProductItem product={product} />
        </div>
      );
    });
  }

  // No longer using category filters in tabs since we have the carousel

  return (
    <section id="all-products-section" className="tp-product-area pb-55">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-xl-12">
            <div className="tp-section-title-wrapper mb-40 text-center">
              <h3 className="tp-section-title">
                Категории <ShapeLine />
              </h3>
            </div>
          </div>
        </div>
        
        {/* Category Carousel Display */}
        <div className="row justify-content-center mb-30">
          <div className="col-xl-12">
            <CategoryCarousel 
              onCategorySelect={handleCategoryChange} 
              selectedCategory={selectedCategory} 
            />
          </div>
        </div>
        
        <div className="row align-items-end">
          <div className="col-xl-5 col-lg-6 col-md-5">
            <div className="tp-section-title-wrapper mb-40">
              <h3 className="tp-section-title">
                Наши товары <ShapeLine />
              </h3>
            </div>
          </div>
          <div className="col-xl-7 col-lg-6 col-md-7">
            <div className="tp-product-tab tp-product-tab-border mb-45 tp-tab d-flex justify-content-md-end">
              {/* Category filters removed - using carousel only */}
            </div>
          </div>
        </div>
        <div className="row">{content}</div>
        
        {/* Pagination */}
        {pageCount > 1 && (
          <div className="row">
            <div className="col-xl-12">
              <div className="tp-pagination mt-35">
                <ReactPaginate
                  breakLabel="..."
                  nextLabel="→"
                  onPageChange={handlePageClick}
                  pageRangeDisplayed={3}
                  pageCount={pageCount}
                  previousLabel="←"
                  renderOnZeroPageCount={null}
                  containerClassName="tp-pagination-style mb-20 text-center"
                  pageLinkClassName="tp-pagination-link"
                  previousLinkClassName="tp-pagination-link"
                  nextLinkClassName="tp-pagination-link"
                  activeLinkClassName="active"
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
