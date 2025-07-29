'use client';
import React, { useState, useEffect } from "react";
import useSearchFormSubmit from "@/hooks/use-search-form-submit";
// импортируем твой хук RTK Query
import { useGetProductCategoriesQuery } from "@/redux/features/productsApi";

const SearchBar = ({ isSearchOpen, setIsSearchOpen }) => {
  const { setSearchText, setCategory, handleSubmit, searchText } = useSearchFormSubmit();

  // Получаем категории из API
  const { data: categoriesData, isLoading, isError } = useGetProductCategoriesQuery();

  // Преобразуем категории для отображения
  // Возьмем только корневые категории (без вложенных)
  const categories = categoriesData?.map(cat => cat.title) || [];

  // selectHandle
  const handleCategory = (value) => {
    setCategory(value);
  };

  return (
    <>
      <section
        className={`tp-search-area tp-search-style-brown ${
          isSearchOpen ? "opened" : ""
        }`}
      >
        <div className="container">
          <div className="row">
            <div className="col-xl-12">
              <div className="tp-search-form">
                <div
                  onClick={() => setIsSearchOpen(false)}
                  className="tp-search-close text-center mb-20"
                >
                  <button className="tp-search-close-btn tp-search-close-btn"></button>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="tp-search-input mb-10">
                    <input
                      onChange={(e) => setSearchText(e.target.value)}
                      value={searchText}
                      type="text"
                      placeholder="Search for product..."
                    />
                    <button type="submit">
                      <i className="flaticon-search-1"></i>
                    </button>
                  </div>
                  <div className="tp-search-category">
                    <span>Search by : </span>
                    {isLoading && <span>Loading categories...</span>}
                    {isError && <span>Error loading categories</span>}
                    {!isLoading && !isError && categories.length === 0 && (
                      <span>No categories found</span>
                    )}
                    {!isLoading && !isError && categories.length > 0 &&
                      categories.map((c, i) => (
                        <a
                          key={i}
                          onClick={() => handleCategory(c)}
                          className="cursor-pointer"
                        >
                          {c}
                          {i < categories.length - 1 && ", "}
                        </a>
                      ))
                    }
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* body overlay */}
      <div
        onClick={() => setIsSearchOpen(false)}
        className={`body-overlay ${isSearchOpen ? "opened" : ""}`}
      ></div>
    </>
  );
};

export default SearchBar;
