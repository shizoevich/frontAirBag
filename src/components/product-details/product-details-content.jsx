'use client';
import React, { useState, useEffect } from "react";
import DetailsThumbWrapper from "./details-thumb-wrapper";
import DetailsWrapper from "./details-wrapper";
import { useDispatch } from "react-redux";
import DetailsTabNav from "./details-tab-nav";
import RelatedProducts from "./related-products";
import ProductsBoughtTogether from "./products-bought-together";

const ProductDetailsContent = ({ productItem }) => {
  const { _id, img, images, imageURLs, videoId, status } = productItem || {};

  // Получаем правильное изображение из API с той же логикой, что и в других компонентах
  const getCorrectImage = () => {
    if (imageURLs && Array.isArray(imageURLs) && imageURLs.length > 0) {
      return imageURLs[0].img || imageURLs[0];
    } else if (images && Array.isArray(images) && images.length > 0) {
      return typeof images[0] === 'string' ? images[0] : images[0].url || images[0].img || images[0];
    } else if (img) {
      return img;
    }
    return '/assets/img/product/3/product-1.jpg';
  };

  const correctImg = getCorrectImage();
  const [activeImg, setActiveImg] = useState(correctImg);
  const dispatch = useDispatch();

  // active image change when img change
  useEffect(() => {
    setActiveImg(correctImg);
  }, [correctImg]);

  // handle image active
  const handleImageActive = (item) => {
    setActiveImg(item.img);
  };

  return (
    <section className="tp-product-details-area">
      <div className="tp-product-details-top pb-115 pt-50">
        <div className="container">
          <div className="row">
            <div className="col-xl-7 col-lg-6">
              {/* product-details-thumb-wrapper start */}
              <DetailsThumbWrapper
                activeImg={activeImg}
                handleImageActive={handleImageActive}
                imageURLs={imageURLs || images || []}
                imgWidth={580}
                imgHeight={670}
                videoId={videoId}
                status={status}
              />
              {/* product-details-thumb-wrapper end */}
            </div>
            <div className="col-xl-5 col-lg-6">
              {/* product-details-wrapper start */}
              <DetailsWrapper
                productItem={productItem}
                handleImageActive={handleImageActive}
                activeImg={activeImg}
                detailsBottom={true}
              />
              {/* product-details-wrapper end */}
            </div>
          </div>
        </div>
      </div>

      {/* products bought together start */}
      <ProductsBoughtTogether togetherBuyProducts={productItem?.together_buy} />
      {/* products bought together end */}
    </section>
  );
};

export default ProductDetailsContent;