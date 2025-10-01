import React from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { SmDot } from '@/svg';
import { slugify } from '@/utils/slugify';

const ProductDetailsBreadcrumb = ({ category, title }) => {
  const locale = useLocale();

  // Ensure category is an object with title and id for robust linking
  const categoryTitle = category?.title || 'Category';
  const categoryId = category?.id;
  const categorySlug = categoryId ? `${slugify(categoryTitle)}-${categoryId}` : slugify(categoryTitle);

  return (
    <section className="breadcrumb__area breadcrumb__style-2 include-bg pt-50 pb-20">
      <div className="container">
        <div className="row">
          <div className="col-xxl-12">
            <div className="breadcrumb__content p-relative z-index-1">
              <div className="breadcrumb__list has-icon">
                <span className="breadcrumb-icon">
                  <SmDot />{" "}
                </span>
                <span>
                  <Link href={`/${locale}`}>Home</Link>
                </span>
                {categoryId && (
                  <span>
                    <Link href={`/${locale}/category/${categorySlug}`}>{categoryTitle}</Link>
                  </span>
                )}
                <span>{title}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductDetailsBreadcrumb;