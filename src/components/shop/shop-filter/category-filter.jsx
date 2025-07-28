'use client'
import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch } from "react-redux";
// internal
import ErrorMsg from "@/components/common/error-msg";
import { handleFilterSidebarClose } from "@/redux/features/shop-filter-slice";
import ShopCategoryLoader from "@/components/loader/shop/shop-category-loader";
// categories data
import { getRootCategories, getChildCategories } from "@/data/categories";

const CategoryFilter = ({ setCurrPage, shop_right = false }) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const categoryId = searchParams.get('category_id');

  // handle category route with id_remonline
  const handleCategoryRoute = (idRemonline) => {
    setCurrPage(1);
    router.push(
      `/${shop_right ? 'shop-right-sidebar' : 'shop'}?category_id=${idRemonline}`
    );
    dispatch(handleFilterSidebarClose());
  };

  // render category tree
  const renderCategoryTree = () => {
    return getRootCategories().map((rootCategory) => (
      <React.Fragment key={rootCategory.id}>
        <li>
          <a
            onClick={() => handleCategoryRoute(rootCategory.id)}
            style={{ cursor: "pointer" }}
            className={categoryId === String(rootCategory.id) ? "active" : ""}
          >
            {rootCategory.title}
          </a>
          
          {/* Render child categories if they exist */}
          {getChildCategories(rootCategory.id).length > 0 && (
            <ul className="sub-categories">
              {getChildCategories(rootCategory.id).map((childCategory) => (
                <li key={childCategory.id}>
                  <a
                    onClick={() => handleCategoryRoute(childCategory.id)}
                    style={{ cursor: "pointer" }}
                    className={categoryId === String(childCategory.id) ? "active" : ""}
                  >
                    {childCategory.title}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </li>
      </React.Fragment>
    ));
  };

  return (
    <div className="tp-shop-widget mb-50">
      <h3 className="tp-shop-widget-title">Категории</h3>
      <div className="tp-shop-widget-content">
        <div className="tp-shop-widget-categories">
          <ul>
            {renderCategoryTree()}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CategoryFilter;