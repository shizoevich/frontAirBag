import React from 'react';
import Image from 'next/image';
import { Rating } from 'react-simple-star-rating';
import Link from 'next/link';
import { useLocale } from 'next-intl';
// internal
import ErrorMsg from '@/components/common/error-msg';
import ShopTopRatedLoader from '@/components/loader/shop/top-rated-prd-loader';
import { useGetTopRatedProductsQuery } from '@/redux/features/productApi';

const TopRatedProducts = () => {
  const locale = useLocale();
  const { data: products, isError, isLoading } = useGetTopRatedProductsQuery();
  // decide what to render
  let content = null;

  if (isLoading) {
    content = (
      <ShopTopRatedLoader loading={isLoading}/>
    );
  }
  else if (!isLoading && isError) {
    content = <ErrorMsg msg="There was an error" />;
  }
  else if (!isLoading && !isError && products?.data?.length === 0) {
    content = <ErrorMsg msg="No Products found!" />;
  }
  else if (!isLoading && !isError && products?.data?.length > 0) {
    const product_items = products.data.slice(0, 3);
    content = product_items.map((item) => (
      <div key={item._id} className="tp-shop-widget-product-item d-flex align-items-center">
        <div className="tp-shop-widget-product-thumb">
          <Link href={`/${locale}/product-details/${item._id}`}>
            <Image src={item.img || 'https://t3.ftcdn.net/jpg/04/34/72/82/360_F_434728286_OWQQvAFoXZLdGHlObozsolNeuSxhpr84.jpg'} alt="product img" width={70} height={70} />
          </Link>
        </div>
        <div className="tp-shop-widget-product-content">
          <div className="tp-shop-widget-product-rating-wrapper d-flex align-items-center">
            <div className="tp-shop-widget-product-rating">
              <Rating allowFraction size={16} initialValue={item.rating} readonly={true} />
            </div>
            <div className="tp-shop-widget-product-rating-number">
              <span>({item.rating})</span>
            </div>
          </div>
          <h4 className="tp-shop-widget-product-title">
            <Link href={`/${locale}/product-details/${item._id}`}>{item.title.substring(0,20)}...</Link>
          </h4>
          <div className="tp-shop-widget-product-price-wrapper">
            <span className="tp-shop-widget-product-price">${(Number(item.price_minor || 0) / 100).toFixed(2)}</span>
          </div>
        </div>
      </div>
    ))
  }
  return (
    <>
      <div className="tp-shop-widget mb-50">
        <h3 className="tp-shop-widget-title">Top Rated Products</h3>
        <div className="tp-shop-widget-content">
          <div className="tp-shop-widget-product">
            {content}
          </div>
        </div>
      </div>
    </>
  );
};

export default TopRatedProducts;