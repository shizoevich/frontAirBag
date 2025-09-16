'use client';
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale } from 'next-intl';
import NiceSelect from "@/ui/nice-select";
import ErrorMsg from "@/components/common/error-msg";
import SearchPrdLoader from "@/components/loader/search-prd-loader";
import { useGetAllProductsQuery, useGetAllProductsNoLimitQuery } from "@/redux/features/productsApi";
import ProductItem from "@/components/products/electronics/product-item";
import ReactPaginate from 'react-paginate';

export default function SearchArea({ translations }) {
  const searchParams = useSearchParams();
  const locale = useLocale();
  const [searchText, setSearchText] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [currentPage, setCurrentPage] = useState(0); // для ReactPaginate (0-based)
  const [isMobile, setIsMobile] = useState(false);
  const itemsPerPage = 12;

  // Извлекаем параметры поиска из URL
  useEffect(() => {
    const urlSearchText = searchParams.get('searchText') || "";
    const urlCategoryId = searchParams.get('categoryId') || "";
    
    setSearchText(urlSearchText);
    setCategoryId(urlCategoryId);
  }, [searchParams]);

  // Отслеживаем размер экрана для адаптивной пагинации
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);
  
  // Запрос на получение товаров с пагинацией и фильтрацией
  const queryParams = {
    limit: itemsPerPage,
    offset: currentPage * itemsPerPage,
    categoryId: categoryId || undefined,
    searchText: searchText || undefined
  };
  
  // Debug logging
  console.log('Search query params:', queryParams);
  console.log('Current searchText:', searchText);
  console.log('Current categoryId:', categoryId);
  
  const { data: productsData, isError, isLoading } = useGetAllProductsQuery(queryParams);
  
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
        
  // Debug logging for API response
  console.log('API Response - productsData:', productsData);
  console.log('API Response - products array:', products);
  console.log('API Response - products count:', products.length);
  console.log('API Response - total count:', productsData?.count);
        
  // Получаем все товары для фильтрации
  const allProducts = Array.isArray(allProductsData) 
    ? allProductsData 
    : Array.isArray(allProductsData?.data) 
      ? allProductsData.data 
      : Array.isArray(allProductsData?.results) 
        ? allProductsData.results 
        : [];

  // Проверяем, есть ли поисковый запрос и нет ли результатов
  const hasSearchQuery = searchText && searchText.trim().length > 0;
  
  // Проверяем, возвращает ли API отфильтрованные результаты или все товары
  // Если есть поисковый запрос, но API возвращает много товаров (>50), 
  // вероятно API игнорирует поиск и возвращает все товары
  const apiIgnoredSearch = hasSearchQuery && products.length > 50;
  
  // Дополнительная проверка: если есть поисковый запрос, но ни один товар не содержит искомый текст
  const noRelevantResults = hasSearchQuery && products.length > 0 && 
    !products.some(product => 
      product.title?.toLowerCase().includes(searchText.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchText.toLowerCase())
    );
  
  const hasNoResults = !isLoading && !isError && (
    (hasSearchQuery && products.length === 0) || 
    (hasSearchQuery && productsData?.count === 0) ||
    apiIgnoredSearch ||
    noRelevantResults
  );
  
  // Debug logging for search logic
  console.log('Search Logic Debug:');
  console.log('- hasSearchQuery:', hasSearchQuery);
  console.log('- apiIgnoredSearch:', apiIgnoredSearch);
  console.log('- noRelevantResults:', noRelevantResults);
  console.log('- hasNoResults:', hasNoResults);
  
  if (hasNoResults) {
    content = (
      <section className="tp-error-area pt-110 pb-110">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-xl-8 col-lg-10 col-md-12">
              <div className="tp-error-content text-center">
                <div className="tp-error-thumb mb-45">
                  <img 
                    src="/assets/img/error/error.png" 
                    alt="no products found" 
                    style={{ maxWidth: '300px', width: '100%', height: 'auto' }}
                  />
                </div>

                <h3 className="tp-error-title mb-25">Товарів не знайдено</h3>
                <p className="mb-35" style={{ fontSize: '16px', color: '#55585B' }}>
                  {searchText 
                    ? `На жаль, за запитом "${searchText}" товарів не знайдено. Спробуйте змінити пошуковий запит або переглянути всі товари.`
                    : 'На жаль, товарів не знайдено. Спробуйте змінити фільтри або переглянути всі товари.'
                  }
                </p>

                <div className="tp-error-btn-wrapper d-flex flex-wrap justify-content-center gap-3">
                  <button 
                    className="tp-error-btn"
                    onClick={() => {
                      setSearchText("");
                      setCategoryId("");
                      window.history.pushState({}, '', `/${locale}/search`);
                      window.location.reload();
                    }}
                  >
                    Очистити фільтри
                  </button>
                  <a href={`/${locale}/`} className="tp-error-btn tp-error-btn-border">
                    На головну
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
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
        <section className="tp-shop-area pb-120 ">
          <div className="container">
            <div className="row">
              <div className="col-xl-12 col-lg-12">
                <div className="tp-shop-main-wrapper">
                  <div className="tp-shop-top mb-45 pt-40">
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
                        breakLabel={isMobile ? "..." : translations.breakLabel}
                        nextLabel={isMobile ? ">" : translations.nextPage}
                        previousLabel={isMobile ? "<" : translations.previousPage}
                        onPageChange={handlePageClick}
                        pageRangeDisplayed={isMobile ? 1 : 3}
                        marginPagesDisplayed={isMobile ? 1 : 2}
                        pageCount={pageCount}
                        renderOnZeroPageCount={null}
                        forcePage={currentPage}
                        containerClassName={`tp-pagination-style mb-20 text-center ${isMobile ? 'mobile-pagination' : ''}`}
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