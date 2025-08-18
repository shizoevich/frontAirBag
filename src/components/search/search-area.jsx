'use client';
import { useState } from "react";
import NiceSelect from "@/ui/nice-select";
import ErrorMsg from "@/components/common/error-msg";
import SearchPrdLoader from "@/components/loader/search-prd-loader";
import { useGetAllProductsQuery, useGetAllProductsNoLimitQuery } from "@/redux/features/productsApi";
import ProductItem from "@/components/products/electronics/product-item";
import ReactPaginate from 'react-paginate';

export default function SearchArea({ translations, initialSearchText, initialCategoryId }) {
  const searchText = initialSearchText;
  const categoryId = initialCategoryId;
  const [currentPage, setCurrentPage] = useState(0); // для ReactPaginate (0-based)
  const itemsPerPage = 12;
  
  // Запрос на получение товаров с пагинацией и фильтрацией
  const { data: productsData, isError, isLoading } = useGetAllProductsQuery({
    limit: itemsPerPage,
    offset: currentPage * itemsPerPage,
    categoryId: categoryId || undefined,
    searchText: searchText || undefined
  });
  
  // Запрос на получение всех товаров для фильтрации
  const { data: allProductsData } = useGetAllProductsNoLimitQuery();
  const [shortValue, setShortValue] = useState("");

  // selectShortHandler
  const shortHandler = (e) => {
    setShortValue(e.value);
  };

  // Handle page change
  const handlePageClick = (event) => {
    setCurrentPage(event.selected);
    // Scroll to top of product section
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // decide what to render
  let content = null;
  if (isLoading) {
    content = <SearchPrdLoader loading={isLoading} />;
  }

  if (!isLoading && isError) {
    content = <ErrorMsg msg={translations.error} />;
  }

  // Получаем товары текущей страницы
  const products = Array.isArray(productsData) 
    ? productsData 
    : Array.isArray(productsData?.data) 
      ? productsData.data 
      : Array.isArray(productsData?.results) 
        ? productsData.results 
        : [];
        
  // Получаем все товары для фильтрации
  const allProducts = Array.isArray(allProductsData) 
    ? allProductsData 
    : Array.isArray(allProductsData?.data) 
      ? allProductsData.data 
      : Array.isArray(allProductsData?.results) 
        ? allProductsData.results 
        : [];

  if (!isLoading && !isError && products.length === 0) {
    content = <ErrorMsg msg={translations.noProductsFound} />;
  }

  if (!isLoading && !isError && products.length > 0) {
    // Используем товары текущей страницы для отображения (фильтрация уже произошла на сервере)
    let product_items = products;
    
    // Price low to high - сортировка на клиенте для текущей страницы
    if (shortValue === "price-asc") {
      product_items = [...product_items].sort((a, b) => Number(a.price_minor) - Number(b.price_minor));
    } else if (shortValue === "price-desc") {
      product_items = [...product_items].sort((a, b) => Number(b.price_minor) - Number(a.price_minor));
    }
    
    if (product_items.length === 0) {
      content = (
        <div className="text-center pt-80 pb-80">
          <h3>{translations.noResults.replace('{searchText}', searchText || '')}</h3>
        </div>
      );
    } else {
      // Используем товары, полученные с сервера с пагинацией
      const paginatedItems = product_items;
      // Используем общее количество из API
      const totalCount = productsData?.count || 0;
      const pageCount = Math.ceil(totalCount / itemsPerPage);
      
      content = (
        <section className="tp-shop-area pb-120">
          <div className="container">
            <div className="row">
              <div className="col-xl-12 col-lg-12">
                <div className="tp-shop-main-wrapper">
                  <div className="tp-shop-top mb-45">
                    <div className="row">
                      <div className="col-xl-6">
                        <div className="tp-shop-top-left d-flex align-items-center">
                          <div className="tp-shop-top-result">
                            <p>Показано {currentPage * itemsPerPage + 1}-{Math.min((currentPage + 1) * itemsPerPage, totalCount)} з {totalCount} товарів</p>
                          </div>
                        </div>
                      </div>
                      <div className="col-xl-6">
                        <div className="tp-shop-top-right d-sm-flex align-items-center justify-content-xl-end">
                          <div className="tp-shop-top-select">
                            <NiceSelect
                              options={[
                                { value: "default", text: translations.shortByPrice },
                                { value: "price-asc", text: translations.priceLowToHigh },
                                { value: "price-desc", text: translations.priceHighToLow },
                              ]}
                              defaultCurrent={0}
                              onChange={shortHandler}
                              name={translations.shortByPrice}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="tp-shop-items-wrapper tp-shop-item-primary">
                    <div className="tab-content" id="productTabContent">
                      <div
                        className="tab-pane fade show active"
                        id="grid-tab-pane"
                        role="tabpanel"
                        aria-labelledby="grid-tab"
                        tabIndex="0"
                      >
                        <div className="row">
                          {paginatedItems.map((item, i) => (
                            <div key={i} className="col-xl-3 col-lg-4 col-md-6 col-sm-6">
                              <ProductItem product={item} />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {pageCount > 1 && (
                    <div className="tp-pagination mt-35">
                      <ReactPaginate
                        breakLabel={translations.breakLabel}
                        nextLabel={translations.nextPage}
                        onPageChange={handlePageClick}
                        pageRangeDisplayed={3}
                        pageCount={pageCount}
                        previousLabel={translations.previousPage}
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
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      );
    }
  }
  
  return (
    <>{content}</>
  );
}