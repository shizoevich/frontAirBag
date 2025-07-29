'use client';
import React, { useEffect, useState } from 'react';
import ErrorMsg from '@/components/common/error-msg';
import ProductItem from './product-item';
import { HomeTwoPrdLoader } from '@/components/loader';

// tabs
const tabs = ['All Collection', 'Shoes', 'Clothing', 'Bags'];

const ProductArea = () => {
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Загружаем данные при монтировании и при смене activeTab
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        // Заменяй URL на твой реальный API, например: /api/products?type=fashion
        const res = await fetch(`/api/products?type=fashion`);
        if (!res.ok) throw new Error('Failed to fetch products');
        const json = await res.json();
        setProducts(json.data || []);
      } catch (err) {
        setError(err.message || 'Error fetching data');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Фильтрация по категории
  const filteredProducts = products.filter(p => {
    if (activeTab === 'All Collection') return true;
    return p.category?.name === activeTab;
  });

  // Рендер
  if (loading) return <HomeTwoPrdLoader loading={loading} />;
  if (error) return <ErrorMsg msg={error} />;
  if (products.length === 0) return <ErrorMsg msg="No Products found!" />;

  return (
    <section className="tp-product-area pb-90">
      <div className="container">
        <div className="row">
          <div className="col-xl-12">
            <div className="tp-product-tab-2 tp-tab mb-50 text-center">
              <nav>
                <div className="nav nav-tabs justify-content-center">
                  {tabs.map((tab, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveTab(tab)}
                      className={`nav-link text-capitalize ${activeTab === tab ? 'active' : ''}`}
                    >
                      {tab}
                      <span className="tp-product-tab-tooltip">{filteredProducts.length}</span>
                    </button>
                  ))}
                </div>
              </nav>
            </div>
          </div>
        </div>
        <div className="row">
          {filteredProducts.map(prd => (
            <div key={prd._id} className="col-xl-3 col-lg-4 col-md-6 col-sm-6">
              <ProductItem product={prd} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductArea;
