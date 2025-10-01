'use client';
import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { useLocale } from 'next-intl';

// Internal imports
import ErrorMsg from '@/components/common/error-msg';
import { handleFilterSidebarClose } from '@/redux/features/shop-filter-slice';
import ShopCategoryLoader from '@/components/loader/shop/shop-category-loader';
import { useGetShowCategoryQuery } from '@/redux/features/categoryApi';
import { slugify } from '@/utils/slugify';

const CategoryFilter = ({ setCurrPage, shop_right = false }) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const locale = useLocale();
  const searchParams = useSearchParams();
  const activeCategorySlug = searchParams.get('category');

  const { data: categories, isLoading, isError } = useGetShowCategoryQuery();

  // Handle category route navigation using slugs
  const handleCategoryRoute = (category) => {
    setCurrPage(1);
    const slug = `${slugify(category.title)}-${category.id}`;
    // We navigate to the main shop page with a query param, 
    // but a more SEO-friendly approach would be a route like /shop/[categorySlug]
    router.push(`/${locale}/${shop_right ? 'shop-right-sidebar' : 'shop'}?category=${slug}`);
    dispatch(handleFilterSidebarClose());
  };

  // Build a tree from the flat category list
  const categoryTree = React.useMemo(() => {
    if (!categories) return [];
    const categoryMap = {};
    const roots = [];

    categories.forEach(category => {
      categoryMap[category.id] = { ...category, children: [] };
    });

    categories.forEach(category => {
      if (category.parent_id) {
        categoryMap[category.parent_id]?.children.push(categoryMap[category.id]);
      } else {
        roots.push(categoryMap[category.id]);
      }
    });

    return roots;
  }, [categories]);

  // Recursive function to render the category tree
  const renderCategoryTree = (nodes) => {
    return nodes.map((category) => {
      const slug = `${slugify(category.title)}-${category.id}`;
      return (
        <React.Fragment key={category.id}>
          <li>
            <a
              onClick={() => handleCategoryRoute(category)}
              style={{ cursor: 'pointer' }}
              className={activeCategorySlug === slug ? 'active' : ''}
            >
              {category.title}
            </a>
            {category.children.length > 0 && (
              <ul className="sub-categories">
                {renderCategoryTree(category.children)}
              </ul>
            )}
          </li>
        </React.Fragment>
      );
    });
  };

  let content = null;
  if (isLoading) {
    content = <ShopCategoryLoader loading={isLoading} />;
  } else if (isError) {
    content = <ErrorMsg msg="Failed to load categories" />;
  } else if (categoryTree.length === 0) {
    content = <ErrorMsg msg="No categories found" />;
  } else {
    content = <ul>{renderCategoryTree(categoryTree)}</ul>;
  }

  return (
    <div className="tp-shop-widget mb-50">
      <h3 className="tp-shop-widget-title">Categories</h3>
      <div className="tp-shop-widget-content">
        <div className="tp-shop-widget-categories">
          {content}
        </div>
      </div>
    </div>
  );
};

export default CategoryFilter;