'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Filter } from '@/svg';

const ORANGE = '#de8043';

const inputStyle = {
  height: '36px',
  padding: '0 10px',
  border: '1.5px solid #ddd',
  borderRadius: '6px',
  fontSize: '13px',
  color: '#333',
  backgroundColor: '#fff',
  outline: 'none',
  width: '90px',
};

const ProductsFilterBar = ({ filters, onFilterChange, onReset }) => {
  const t = useTranslations('ProductsFilterBar');

  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [priceMinInput, setPriceMinInput] = useState(filters.priceMin);
  const [priceMaxInput, setPriceMaxInput] = useState(filters.priceMax);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    setPriceMinInput(filters.priceMin);
    setPriceMaxInput(filters.priceMax);
  }, [filters.priceMin, filters.priceMax]);

  const applyPrice = () => {
    onFilterChange({ priceMin: priceMinInput, priceMax: priceMaxInput });
  };

  const handlePriceKeyDown = (e) => {
    if (e.key === 'Enter') applyPrice();
  };

  const activeCount = [
    filters.ordering !== '',
    filters.priceMin !== '',
    filters.priceMax !== '',
    filters.inStock,
  ].filter(Boolean).length;

  const hasActiveFilters = activeCount > 0;

  return (
    <div style={{ marginBottom: '24px' }}>
      {/* Toggle row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        {/* Filter toggle button */}
        <button
          onClick={() => setIsOpen((v) => !v)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: isMobile ? 'center' : 'flex-start',
            gap: '7px',
            width: isMobile ? '100%' : 'auto',
            height: '42px',
            padding: '0 16px',
            border: `1.5px solid ${isOpen || hasActiveFilters ? ORANGE : '#ccc'}`,
            borderRadius: '6px',
            backgroundColor: isOpen ? ORANGE : 'transparent',
            color: isOpen ? '#fff' : hasActiveFilters ? ORANGE : '#555',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            userSelect: 'none',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', color: 'inherit' }}>
            <Filter />
          </span>
          <span>{t('filtersTitle')}</span>
          {activeCount > 0 && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                backgroundColor: isOpen ? 'rgba(255,255,255,0.3)' : ORANGE,
                color: '#fff',
                fontSize: '11px',
                fontWeight: '700',
                lineHeight: '1',
              }}
            >
              {activeCount}
            </span>
          )}
          <span
            style={{
              display: 'inline-flex',
              marginLeft: isMobile ? 'auto' : '2px',
              transition: 'transform 0.2s ease',
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
          >
            <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
              <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
        </button>

        {/* Reset button — visible when filters active */}
        {hasActiveFilters && (
          <button
            onClick={onReset}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              height: '38px',
              padding: '0 12px',
              border: '1.5px solid #ddd',
              borderRadius: '6px',
              backgroundColor: 'transparent',
              color: '#888',
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = ORANGE;
              e.currentTarget.style.color = ORANGE;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#ddd';
              e.currentTarget.style.color = '#888';
            }}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M1 1L9 9M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            {t('reset')}
          </button>
        )}
      </div>

      {/* Collapsible panel */}
      <div
        style={{
          overflow: 'hidden',
          maxHeight: isOpen ? '300px' : '0',
          transition: 'max-height 0.28s ease',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '10px',
            padding: '14px 16px',
            marginTop: '8px',
            backgroundColor: '#fafafa',
            border: '1.5px solid #eee',
            borderRadius: '8px',
          }}
        >
          {/* Сортировка */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', color: '#888', whiteSpace: 'nowrap', fontWeight: '500' }}>
              {t('sortLabel')}:
            </span>
            <select
              value={filters.ordering}
              onChange={(e) => onFilterChange({ ordering: e.target.value })}
              style={{ ...inputStyle, width: '190px', cursor: 'pointer' }}
            >
              <option value="">{t('sortDefault')}</option>
              <option value="price_minor">{t('sortPriceAsc')}</option>
              <option value="-price_minor">{t('sortPriceDesc')}</option>
            </select>
          </div>

          {/* Divider — desktop only */}
          {!isMobile && (
            <div style={{ width: '1px', height: '24px', backgroundColor: '#ddd' }} />
          )}

          {/* Цена */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', color: '#888', whiteSpace: 'nowrap', fontWeight: '500' }}>
              {t('priceLabel')}:
            </span>
            <input
              type="number"
              min="0"
              value={priceMinInput}
              onChange={(e) => setPriceMinInput(e.target.value)}
              onBlur={applyPrice}
              onKeyDown={handlePriceKeyDown}
              placeholder={t('priceFrom')}
              style={inputStyle}
            />
            <span style={{ fontSize: '13px', color: '#aaa' }}>—</span>
            <input
              type="number"
              min="0"
              value={priceMaxInput}
              onChange={(e) => setPriceMaxInput(e.target.value)}
              onBlur={applyPrice}
              onKeyDown={handlePriceKeyDown}
              placeholder={t('priceTo')}
              style={inputStyle}
            />
            <span style={{ fontSize: '12px', color: '#888' }}>{t('currency')}</span>
          </div>

          {/* Divider — desktop only */}
          {!isMobile && (
            <div style={{ width: '1px', height: '24px', backgroundColor: '#ddd' }} />
          )}

          {/* В наличии */}
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              cursor: 'pointer',
              fontSize: '13px',
              color: '#444',
              userSelect: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            <div
              style={{
                width: '18px',
                height: '18px',
                border: `2px solid ${filters.inStock ? ORANGE : '#ccc'}`,
                borderRadius: '4px',
                backgroundColor: filters.inStock ? ORANGE : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                flexShrink: 0,
              }}
              onClick={() => onFilterChange({ inStock: !filters.inStock })}
            >
              {filters.inStock && (
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
            <span onClick={() => onFilterChange({ inStock: !filters.inStock })}>
              {t('inStock')}
            </span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default ProductsFilterBar;
