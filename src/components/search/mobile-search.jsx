'use client';
import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import useSearchFormSubmit from '@/hooks/use-search-form-submit';
import { Search } from '@/svg';

const MobileSearch = () => {
  const tSearch = useTranslations('SearchArea');
  const { handleSubmit, searchText, setSearchText } = useSearchFormSubmit();

  return (
    <div className="mobile-search-area d-block d-lg-none mb-40">
      <div className="container">
        <div className="row">
          <div className="col-12">
            <div className="mobile-search-wrapper">
              <form onSubmit={(e) => handleSubmit(e)}>
                <div className="tp-header-search-wrapper d-flex align-items-center">
                  <div className="tp-header-search-box flex-grow-1">
                    <input
                      onChange={(e) => setSearchText(e.target.value)}
                      value={searchText}
                      type="text"
                      placeholder={tSearch('placeholder')}
                      className="mobile-search-input"
                    />
                  </div>
                  <div className="tp-header-search-btn">
                    <button 
                      type="submit"
                      className="mobile-search-btn"
                    >
                      <Search />
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileSearch;
