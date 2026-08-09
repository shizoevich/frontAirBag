'use client';
import { useState, useRef, useEffect } from "react";
import { useTranslations } from 'next-intl';
// internal
import { Search } from "@/svg";
import useSearchFormSubmit from "@/hooks/use-search-form-submit";

const HeaderSearchForm = () => {
  const tForm = useTranslations('HeaderSearchForm');
  const { setSearchText, handleSubmit, searchText } = useSearchFormSubmit();
  const [expanded, setExpanded] = useState(false);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  // Сворачиваем виджет по клику вне него, но только если запрос не введён
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target) &&
        !searchText
      ) {
        setExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [searchText]);

  const expand = () => {
    setExpanded(true);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape' && !searchText) {
      setExpanded(false);
      inputRef.current?.blur();
    }
  };

  // Клик по лупе в свёрнутом состоянии только раскрывает виджет
  const handleButtonClick = (e) => {
    if (!expanded && !searchText) {
      e.preventDefault();
      expand();
    }
  };

  return (
    <form onSubmit={handleSubmit} role="search">
      <div
        ref={wrapperRef}
        className={`tp-header-search-wrapper tp-header-search-widget d-flex align-items-center ${expanded ? 'is-expanded' : ''}`}
        aria-expanded={expanded}
      >
        <div className="tp-header-search-box">
          <input
            ref={inputRef}
            onChange={(e) => setSearchText(e.target.value)}
            onFocus={() => setExpanded(true)}
            onClick={expand}
            onKeyDown={handleKeyDown}
            value={searchText}
            type="text"
            placeholder={tForm('placeholder')}
          />
        </div>
        <div className="tp-header-search-btn">
          <button
            type="submit"
            onClick={handleButtonClick}
            aria-label={tForm('placeholder')}
          >
            <Search />
          </button>
        </div>
      </div>
    </form>
  );
};

export default HeaderSearchForm;
