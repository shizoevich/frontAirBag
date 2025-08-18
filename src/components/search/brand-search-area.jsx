'use client';
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShapeLine } from "@/svg";
import ProductItem from "../products/electronics/product-item";
import ErrorMsg from "@/components/common/error-msg";
import HomePrdLoader from "@/components/loader/home/home-prd-loader";
import { useGetShowCategoryQuery } from "@/redux/features/categoryApi";
import { useGetAllProductsQuery } from "@/redux/features/productsApi";
import ReactPaginate from 'react-paginate';
import { useTranslations } from 'next-intl';

// Fallback image URL
const FALLBACK_IMAGE = 'https://t3.ftcdn.net/jpg/04/34/72/82/360_F_434728286_OWQQvAFoXZLdGHlObozsolNeuSxhpr84.jpg';

// Function to get brand image based on brand name
const getBrandImage = (brandName) => {
  if (!brandName) return FALLBACK_IMAGE;
  
  const brandLower = brandName.toLowerCase();
  
  // Map of brand names to their logo images
  const brandImages = {
    'jeep': '/assets/img/brands/jeep.png',
    'hyundai': '/assets/img/brands/hyundai.png',
    'lexus': '/assets/img/brands/lexus.png',
    'audi': '/assets/img/brands/audi.png',
    'acura': '/assets/img/brands/acura.png',
    'bmw': '/assets/img/brands/bmw.png',
    'dodge': '/assets/img/brands/dodge.png',
    'buick': '/assets/img/brands/buick.png',
    'chevrolet': '/assets/img/brands/chevrolet.png',
    'ford': '/assets/img/brands/ford.png',
    'honda': '/assets/img/brands/honda.png',
    'lincoln': '/assets/img/brands/lincoln.png',
    'mitsubishi': '/assets/img/brands/mitsubishi.png',
    'mazda': '/assets/img/brands/mazda.png',
    'nissan': '/assets/img/brands/nissan.png',
    'subaru': '/assets/img/brands/subaru.png',
    'toyota': '/assets/img/brands/toyota.png',
    'vw': '/assets/img/brands/volkswagen.png',
    'tesla': '/assets/img/brands/tesla.png',
    'infiniti': '/assets/img/brands/infiniti.png',
    'porsche': '/assets/img/brands/porsche.png',
    'land rover': '/assets/img/brands/landrover.png',
    'mustang': '/assets/img/brands/mustang.png',
    'cadillac': '/assets/img/brands/cadillac.png',
    'mercedes': '/assets/img/brands/mercedes.png',
    'merсedes': '/assets/img/brands/mercedes.png', // Handle cyrillic 'с'
    'mini cooper': '/assets/img/brands/mini.png',
    'gmc': '/assets/img/brands/gmc.png',
    'fiat': '/assets/img/brands/fiat.png'
  };
  
  return brandImages[brandLower] || FALLBACK_IMAGE;
};

const BrandSearchArea = () => {
  const t = useTranslations('Categories');
  const tSearch = useTranslations('SearchArea');
  const tProducts = useTranslations('AllProductsArea');
  
  const [mounted, setMounted] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const itemsPerPage = 12; // Number of products per page
  
  // Всегда показываем товары из категории Covers (754099)
  const selectedCategoryId = selectedSubcategory || 754099;
  
  useEffect(() => {
    setMounted(true);
  }, []);

  // Get categories for filter
  const {
    data: categoriesData,
    isLoading: catLoading,
    isError: catError
  } = useGetShowCategoryQuery();

  // Get products with pagination and filtering
  const {
    data: productsData = [],
    isLoading: productsLoading,
    isError: productsError
  } = useGetAllProductsQuery({
    limit: itemsPerPage,
    offset: currentPage * itemsPerPage,
    categoryId: selectedCategoryId
  });

  // Convert categories data to array
  const allCategories = Array.isArray(categoriesData) 
    ? categoriesData 
    : Array.isArray(categoriesData?.data) 
      ? categoriesData.data 
      : Array.isArray(categoriesData?.results) 
        ? categoriesData.results 
        : [];

  // Получаем только марки автомобилей (подкатегории Covers - parent_id = 754099)
  const carBrands = allCategories.filter(cat => 
    cat && String(cat.parent_id) === '754099'
  );

  // Обрабатываем данные товаров
  const safeProductsData = Array.isArray(productsData) 
    ? productsData 
    : Array.isArray(productsData?.results) 
      ? productsData.results 
      : [];

  // Общее количество товаров для пагинации
  const totalProducts = productsData?.count || safeProductsData.length;
  const totalPages = Math.ceil(totalProducts / itemsPerPage);

  // Handle page change
  const handlePageClick = (event) => {
    setCurrentPage(event.selected);
  };

  // Handle category selection
  const handleCategorySelect = (categoryId) => {
    setSelectedSubcategory(categoryId);
    setCurrentPage(0); // Reset to first page when category changes
  };

  // Get selected category name
  const getSelectedCategoryName = () => {
    if (selectedSubcategory) {
      const category = allCategories.find(cat => String(cat.id) === String(selectedSubcategory));
      return category ? category.title : '';
    }
    return t('all_covers');
  };

  if (!mounted) {
    return null;
  }

  return (
    <section className="tp-product-area pb-90">
      <div className="container">
        <div className="row">
          <div className="col-xl-12">
            <div className="tp-section-title-wrapper-2 mb-40 pt-40">
              <h3 className="tp-section-title-2">{t('car_brands')}</h3>
              <p className="text-muted">{t('search_parts_by_car_brand')}</p>
            </div>
          </div>
        </div>
        
        {/* Карусель марок автомобилей */}
        <div className="row mb-40">
          <div className="col-xl-12">
            <div className="tp-category-carousel">
              <div className="row">
                {/* Кнопка "Все накладки" */}
                <div className="col-xl-2 col-lg-3 col-md-4 col-sm-6 mb-20">
                  <div 
                    className={`tp-category-item text-center cursor-pointer ${!selectedSubcategory ? 'active' : ''}`}
                    onClick={() => handleCategorySelect(null)}
                  >
                    <div className="tp-category-thumb">
                      <Image 
                        src={FALLBACK_IMAGE} 
                        alt="All Covers"
                        width={100}
                        height={100}
                        className="rounded"
                      />
                    </div>
                    <div className="tp-category-content">
                      <h4 className="tp-category-title">{t('all_covers')}</h4>
                    </div>
                  </div>
                </div>
                
                {/* Марки автомобилей */}
                {carBrands.map((brand) => (
                  <div key={brand.id} className="col-xl-2 col-lg-3 col-md-4 col-sm-6 mb-20">
                    <div 
                      className={`tp-category-item text-center cursor-pointer ${selectedSubcategory === brand.id ? 'active' : ''}`}
                      onClick={() => handleCategorySelect(brand.id)}
                    >
                      <div className="tp-category-thumb">
                        <Image 
                          src={getBrandImage(brand.title)} 
                          alt={brand.title}
                          width={100}
                          height={100}
                          className="rounded"
                        />
                      </div>
                      <div className="tp-category-content">
                        <h4 className="tp-category-title">{brand.title}</h4>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
                  <div className="mb-20">
                    <h4>{getSelectedCategoryName()}</h4>
                    <p className="text-muted">
                      {totalProducts > 0 ? `${tProducts('showing')} ${totalProducts} ${tProducts('products')}` : ''}
                    </p>
                  </div>
                  
                  <div className="row">
                    {productsLoading && !productsError && (
                      <HomePrdLoader loading={productsLoading} />
                    )}
                    {!productsLoading && productsError && (
                      <ErrorMsg msg={t('loadingError')} />
                    )}
                    {!productsLoading && !productsError && safeProductsData.length === 0 && (
                      <ErrorMsg msg={tProducts('noProductsFound')} />
                    )}
                    {!productsLoading && !productsError && safeProductsData.length > 0 && 
                      safeProductsData.map((item) => (
                        <div key={item.id} className="col-xl-3 col-lg-4 col-md-6 col-sm-6">
                          <ProductItem product={item} />
                        </div>
                      ))
                    }
                  </div>
                  
                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="tp-pagination mt-20">
                      <ReactPaginate
                        breakLabel={tSearch('breakLabel')}
                        nextLabel={tSearch('nextPage')}
                        onPageChange={handlePageClick}
                        pageRangeDisplayed={3}
                        pageCount={totalPages}
                        previousLabel={tSearch('previousPage')}
                        renderOnZeroPageCount={null}
                        containerClassName="tp-pagination-nav"
                        pageLinkClassName="tp-pagination-link"
                        previousLinkClassName="tp-pagination-link"
                        nextLinkClassName="tp-pagination-link"
                        activeLinkClassName="active"
                        forcePage={currentPage}
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

export default BrandSearchArea;
