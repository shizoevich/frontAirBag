'use client'
import React, { useState,useEffect } from "react";
import {useSearchParams, useRouter} from 'next/navigation';
import ShopLoader from "../loader/shop/shop-loader";
import ErrorMsg from "../common/error-msg";
import ShopFilterOffCanvas from "../common/shop-filter-offcanvas";
import { useGetAllProductsQuery, useGetAllProductsNoLimitQuery } from "@/redux/features/productsApi";
import ShopContent from "./shop-content";

const ShopArea = ({shop_right=false,hidden_sidebar=false}) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const category = searchParams.get('category');
  const brand = searchParams.get('brand');
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');
  const subCategory = searchParams.get('subCategory');
  const filterColor = searchParams.get('color');
  const status = searchParams.get('status');
  const [itemsPerPage] = useState(12);
  const { data: products, isError, isLoading } = useGetAllProductsQuery({
    limit: itemsPerPage,
    offset: (currPage - 1) * itemsPerPage
  });
  const { data: allProducts, isLoading: isLoadingAll } = useGetAllProductsNoLimitQuery();
  const [priceValue, setPriceValue] = useState([0, 0]);
  const [selectValue, setSelectValue] = useState("");
  const [currPage, setCurrPage] = useState(1);

  // Load the maximum price once all products have been loaded
  useEffect(() => {
    if (!isLoadingAll && !isError && allProducts?.data?.length > 0) {
      const maxPrice = allProducts.data.reduce((max, product) => {
        return product.price_minor > max ? product.price_minor : max;
      }, 0);
      setPriceValue([0, maxPrice]);
    }
  }, [isLoadingAll, isError, allProducts]);

  // handleChanges
  const handleChanges = (val) => {
    setCurrPage(1);
    setPriceValue(val);
  };

  // selectHandleFilter
  const selectHandleFilter = (e) => {
    setSelectValue(e.value);
  };

  // other props
  const otherProps = {
    priceFilterValues: {
      priceValue,
      handleChanges,
      setPriceValue,
    },
    selectHandleFilter,
    currPage,
    setCurrPage,
  };
  // decide what to render
  let content = null;

  if (isLoading) {
    content = <ShopLoader loading={isLoading}/>;
  }
  if (!isLoading && isError) {
    content = <div className="pb-80 text-center">
      <ErrorMsg msg="There was an error" />
    </div>;
  }
  if (!isLoading && !isError && products?.results?.length === 0) {
    content = <ErrorMsg msg="No Products found!" />;
  }
  if (!isLoading && !isError && products?.results?.length > 0) {
    // products
    let product_items = products.results;
    // select short filtering
    if (selectValue) {
      if (selectValue === "Default Sorting") {
        product_items = products.data;
      } else if (selectValue === "Low to High") {
        product_items = products.data
          .slice()
          .sort((a, b) => Number(a.price_minor) - Number(b.price_minor));
      } else if (selectValue === "High to Low") {
        product_items = products.data
          .slice()
          .sort((a, b) => Number(b.price_minor) - Number(a.price_minor));
      } else if (selectValue === "New Added") {
        product_items = products.data
          .slice()
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      } else if (selectValue === "On Sale") {
        product_items = products.data.filter((p) => p.discount > 0);
      } else {
        product_items = products.data;
      }
    }

    // status filter
    if (status) {
      if (status === "on-sale") {
        product_items = product_items.filter((p) => p.discount > 0);
      } else if (status === "in-stock") {
        product_items = product_items.filter((p) => p.status === "in-stock");
      }
    }

    // category filter
    if (category) {
      product_items = product_items.filter(
        (p) =>
          p.parent.toLowerCase().replace("&", "").split(" ").join("-") ===
          category
      );
    }

    // category filter
    if (subCategory) {
      product_items = product_items.filter(
        (p) =>
          p.children.toLowerCase().replace("&", "").split(" ").join("-") ===
          subCategory
      );
    }

    // color filter
    if (filterColor) {
      product_items = product_items.filter((product) => {
        for (let i = 0; i < product.imageURLs.length; i++) {
          const color = product.imageURLs[i]?.color;
          if (
            color &&
            color?.name.toLowerCase().split(" ").join("-") === filterColor
          ) {
            return true; // match found, include product in result
          }
        }
        return false; // no match found, exclude product from result
      });
    }

    // brand filter
    if (brand) {
      product_items = product_items.filter(
        (p) =>
          p.brand.name.toLowerCase().split(" ").join("-").replace("&", "") ===
          brand
      );
    }

    if(minPrice && maxPrice){
      product_items = product_items.filter((p) => Number(p.price_minor) >= Number(minPrice) && 
      Number(p.price_minor) <= Number(maxPrice))
    }
    

    content = (
      <>

      <ShopContent 
        all_products={allProducts?.data || []}
        products={product_items}
        otherProps={otherProps}
        shop_right={shop_right}
        hidden_sidebar={hidden_sidebar}
        totalCount={products.count || 0}
        itemsPerPage={itemsPerPage}
      />
        
         <ShopFilterOffCanvas
          all_products={products.data}
          otherProps={otherProps}
        /> 
      </>
    );
  }



 


  return (
    <>
      {content}
    </>
  );
};

export default ShopArea;
