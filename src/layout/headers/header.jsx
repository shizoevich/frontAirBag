'use client';
'use client';
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { useTranslations } from 'next-intl';
// internal
import Menus from "./header-com/menus";
import useSticky from "@/hooks/use-sticky";
import logo from "@assets/img/logo/auto-delivery-logo-nobg.png";
import useCartInfo from "@/hooks/use-cart-info";
import OffCanvas from "@/components/common/off-canvas";
import { openCartMini, closeCartMini } from "@/redux/features/cartSlice";
import HeaderCategory from "./header-com/header-category";
import HeaderTopRight from "./header-com/header-top-right";
import HeaderMainRight from "./header-com/header-main-right";
import CartMiniSidebar from "@/components/common/cart-mini-sidebar";
import HeaderSearchForm from "@/components/forms/header-search-form";
import { CartTwo, CategoryMenu, Compare, Menu, Phone, ShippingCar } from "@/svg";

const Header = () => {
  const t = useTranslations('Header');

  const { cartMiniOpen } = useSelector((state) => state.cart);
  const [isOffCanvasOpen, setIsCanvasOpen] = useState(false);
  const [isCategoryActive, setIsCategoryActive] = useState(false);
  const { quantity } = useCartInfo();
  const { sticky } = useSticky();
  const dispatch = useDispatch();
  
  // Close category menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isCategoryActive && !event.target.closest('.tp-header-category')) {
        setIsCategoryActive(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCategoryActive]);
  
  // Handle cart mini sidebar
  const handleCartMini = () => {
    dispatch(openCartMini());
  };
  
  const handleCloseCartMini = () => {
    dispatch(closeCartMini());
  };
  return (
    <>
      {/* Cart Mini Sidebar */}
      <CartMiniSidebar />
      
      {/* Mobile Off Canvas Menu */}
      <OffCanvas isOffCanvasOpen={isOffCanvasOpen} setIsCanvasOpen={setIsCanvasOpen} />
      
      <header className={sticky ? "header-sticky" : ""}>
        <div className="tp-header-area p-relative z-index-11">
          {/* header top start  */}
          <div className="tp-header-top black-bg p-relative z-index-1 d-none d-md-block">
            <div className="container">
              <div className="row align-items-center">
                <div className="col-md-6">
                  <div className="tp-header-welcome d-flex align-items-center">
                    <span>
                      <ShippingCar />
                    </span>
                    <p>{t('shippingInfo')}</p>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="tp-header-top-right d-flex align-items-center justify-content-end">
                    <HeaderTopRight />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* header main start */}
          <div className="tp-header-main tp-header-sticky">
            <div className="container">
              <div className="row align-items-center">
                <div className="col-xl-2 col-lg-2 col-md-4 col-6">
                  <div className="logo">
                    <Link href="/">
                      <Image 
                        src={logo} 
                        alt="logo" 
                        style={{
                          maxWidth: '140px',
                          maxHeight: '70px',
                          width: 'auto',
                          height: 'auto',
                          objectFit: 'contain'
                        }}
                        width={140}
                        height={70}
                      />
                    </Link>
                  </div>
                </div>
                <div className="col-xl-6 col-lg-7 d-none d-lg-block">
                  <div className="tp-header-search pl-70">
                    <HeaderSearchForm />
                  </div>
                </div>
                <div className="col-xl-4 col-lg-3 col-md-8 col-6">
                  <HeaderMainRight setIsCanvasOpen={setIsCanvasOpen} />
                </div>
              </div>
            </div>
          </div>

          {/* header bottom start */}
          <div className="tp-header-bottom tp-header-bottom-border d-none d-lg-block pt-10">
            <div className="container">
              <div className="tp-mega-menu-wrapper p-relative">
                <div className="row align-items-center">
                  <div className="col-xl-1 col-lg-0">
                    {/* category start */}
                    <div className="tp-header-category tp-category-menu tp-header-category-toggle">

                      <nav className="tp-category-menu-content">
                        <HeaderCategory categoryType="electronics" isCategoryActive={isCategoryActive} />
                      </nav>
                    </div>
                    {/* category end */}
                  </div>
                  <div className="col-xl-7 col-lg-7">
                    <div className="main-menu menu-style-1">
                      <nav className="tp-main-menu-content">
                        <Menus />
                      </nav>
                    </div>
                  </div>
                  <div className="col-xl-4 col-lg-4">
                    <div className="tp-header-contact d-flex align-items-center justify-content-end">
                      <div className="tp-header-contact-icon" style={{marginRight: '12px'}}>
                        <span style={{fontSize: '24px', color: '#de8043', display: 'flex', alignItems: 'center'}}>
                          <Phone />
                        </span>
                      </div>
                      <div className="tp-footer-talk" style={{display: 'flex', alignItems: 'center'}}>
                        <h4 style={{margin: 0, lineHeight: 1}}>
                          <a href="tel:+380989989828">+38 098 998 9828</a>
                        </h4>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* sticky header start */}
      <div id="header-sticky-2" className={`tp-header-sticky-area ${sticky ? 'header-sticky-2' : ''}`}>
        <div className="container">
          <div className="tp-mega-menu-wrapper p-relative">
            <div className="row align-items-center">
              <div className="col-xl-2 col-lg-2 col-md-3 col-6">
                <div className="logo">
                  <Link href="/">
                    <Image 
                      src={logo} 
                      alt="logo" 
                      style={{
                        maxWidth: '80px',
                        maxHeight: '40px',
                        width: 'auto',
                        height: 'auto',
                        objectFit: 'contain'
                      }}
                      width={80}
                      height={40}
                    />
                  </Link>
                </div>
              </div>
              <div className="col-xl-7 col-lg-7 col-md-6 d-none d-md-block">
                <div className="tp-header-sticky-menu main-menu menu-style-1 d-none d-lg-block">
                  <nav id="mobile-menu">
                    <Menus />
                  </nav>
                </div>
              </div>
              <div className="col-xl-3 col-lg-3 col-md-3 col-6">
                <div className="tp-header-action d-flex align-items-center justify-content-end ml-50">
                  <div className="tp-header-action-item d-none d-lg-block">
                    <Link href="/compare" className="tp-header-action-btn">
                      <Compare />
                    </Link>
                  </div>

                  <div className="tp-header-action-item">
                    <button onClick={() => dispatch(openCartMini())} type="button" className="tp-header-action-btn cartmini-open-btn">
                      <CartTwo />
                      <span className="tp-header-action-badge">{quantity}</span>
                    </button>
                  </div>
                  <div className="tp-header-action-item d-lg-none">
                    <button onClick={() => setIsCanvasOpen(true)} type="button" className="tp-header-action-btn tp-offcanvas-open-btn">
                      <Menu />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* sticky header end */}

      {/* cart mini sidebar start */}
      <CartMiniSidebar />
      {/* cart mini sidebar end */}

      {/* off canvas start */}
      <OffCanvas isOffCanvasOpen={isOffCanvasOpen} setIsCanvasOpen={setIsCanvasOpen} categoryType="electronics" />
      {/* off canvas end */}
    </>
  );
};

export default Header;
