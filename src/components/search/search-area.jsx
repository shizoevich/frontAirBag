'use client';
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import NiceSelect from "@/ui/nice-select";
import ErrorMsg from "@/components/common/error-msg";
import SearchPrdLoader from "@/components/loader/search-prd-loader";
import { useGetAllProductsQuery } from "@/redux/features/productsApi";
import ProductItem from "@/components/products/electronics/product-item";
import ReactPaginate from 'react-paginate';

export default function SearchArea() {
  const searchParams = useSearchParams();
  const searchText = searchParams.get('searchText');
  const categoryId = searchParams.get('categoryId');
  const { data: productsData, isError, isLoading } = useGetAllProductsQuery();
  const [shortValue, setShortValue] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 12;

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
    content = <ErrorMsg msg="There was an error" />;
  }

  const products = Array.isArray(productsData) 
    ? productsData 
    : Array.isArray(productsData?.data) 
      ? productsData.data 
      : Array.isArray(productsData?.results) 
        ? productsData.results 
        : [];

  if (!isLoading && !isError && products.length === 0) {
    content = <ErrorMsg msg="No products found!" />;
  }

  if (!isLoading && !isError && products.length > 0) {
    let all_products = products;
    let product_items = all_products;

    if (searchText) {
      product_items = all_products.filter((prd) => {
        const titleMatch = prd.title.toLowerCase().includes(searchText.toLowerCase());
        const categoryMatch = prd.category?.title?.toLowerCase().includes(searchText.toLowerCase());
        return titleMatch || categoryMatch;
      });
    }
    
    if (categoryId && categoryId !== "Select Category") {
      product_items = product_items.filter(prd => {
        const prdCategoryId = prd.category?.id_remonline || prd.category_id;
        return prdCategoryId === categoryId || prdCategoryId === parseInt(categoryId);
      });
    }
    
    // Price low to high
    if (shortValue === "Price low to high") {
      product_items = [...product_items].sort((a, b) => Number(a.price) - Number(b.price));
    } else if (shortValue === "Price high to low") {
      product_items = [...product_items].sort((a, b) => Number(b.price) - Number(a.price));
    }
    
    if (product_items.length === 0) {
      content = (
        <div className="text-center pt-80 pb-80">
          <h3>Sorry, nothing matched <span style={{color:'#0989FF'}}>{searchText}</span> search terms</h3>
        </div>
      );
    } else {
      // Apply pagination
      const offset = currentPage * itemsPerPage;
      const paginatedItems = product_items.slice(offset, offset + itemsPerPage);
      const pageCount = Math.ceil(product_items.length / itemsPerPage);
      
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
                            <p>Showing {offset + 1}–{Math.min(offset + itemsPerPage, product_items.length)} of {product_items.length} results</p>
                          </div>
                        </div>
                      </div>
                      <div className="col-xl-6">
                        <div className="tp-shop-top-right d-sm-flex align-items-center justify-content-xl-end">
                          <div className="tp-shop-top-select">
                            <NiceSelect
                              options={[
                                { value: "Short By Price", text: "Short By Price" },
                                { value: "Price low to high", text: "Price low to high" },
                                { value: "Price high to low", text: "Price high to low" },
                              ]}
                              defaultCurrent={0}
                              onChange={shortHandler}
                              name="Short By Price"
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