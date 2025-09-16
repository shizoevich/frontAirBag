'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
// internal
import { CloseTwo, Search } from '@/svg';
import logo from '@assets/img/logo/auto-delivery-logo-nobg.png';
import contact_img from '@assets/img/icon/contact.png';
import MobileCategory from '@/layout/headers/header-com/mobile-category';
import MobileMenus from "./mobile-menus";
import LanguageSwitcher from './language-switcher'; 

import useSearchFormSubmit from "@/hooks/use-search-form-submit";

const OffCanvas = ({ isOffCanvasOpen, setIsCanvasOpen }) => {
  const t = useTranslations('OffCanvas');
  const tSearch = useTranslations('HeaderSearchForm');
  const locale = useLocale();
  const router = useRouter();
  
  // Mobile search functionality
  const { setSearchText, handleSubmit, searchText } = useSearchFormSubmit();

  // Функция для добавления локали к ссылкам
  const getLocalizedLink = (link) => {
    if (!link) return '#';
    if (link.startsWith('/')) {
      return `/${locale}${link}`;
    }
    return link;
  };
  
  // Close offcanvas when route changes
  useEffect(() => {
    const handleRouteChange = () => {
      setIsCanvasOpen(false);
    };
    
    // Clean up event listener
    return () => {
      handleRouteChange();
    };
  }, [setIsCanvasOpen]);

  return (
    <>
      <div className={`offcanvas__area offcanvas__radius ${isOffCanvasOpen ? "offcanvas-opened" : ""}`}>
        <div className="offcanvas__wrapper">
          <div className="offcanvas__close">
            <button onClick={() => setIsCanvasOpen(false)} className="offcanvas__close-btn offcanvas-close-btn">
              <CloseTwo />
            </button>
          </div>
          <div className="offcanvas__content">
            <div className="offcanvas__top mb-70 d-flex justify-content-between align-items-center">
              <div className="offcanvas__logo logo">
                <Link href={getLocalizedLink("/")} onClick={() => setIsCanvasOpen(false)}>
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
            
            {/* Mobile Search */}
            <div className="offcanvas__search mb-40">
              <form onSubmit={(e) => {
                handleSubmit(e);
                setIsCanvasOpen(false);
              }}>
                <div className="tp-header-search-wrapper d-flex align-items-center">
                  <div className="tp-header-search-box flex-grow-1">
                    <input
                      onChange={(e) => setSearchText(e.target.value)}
                      value={searchText}
                      type="text"
                      placeholder={tSearch('placeholder')}
                      style={{
                        width: '100%',
                        padding: '12px 15px',
                        fontSize: '14px',
                        outline: 'none'
                      }}
                    />
                  </div>
                  <div className="tp-header-search-btn">
                    <button 
                      type="submit"
                      style={{
                        padding: '12px 15px',
                        backgroundColor: '#de8043',
                        border: 'none',
                        color: 'white',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Search />
                    </button>
                  </div>
                </div>
              </form>
            </div>
            
            <div className="tp-main-menu-mobile fix d-lg-none mb-40">
              <MobileMenus setIsCanvasOpen={setIsCanvasOpen} />
            </div>

            <div className="offcanvas__contact align-items-center d-none">
              <div className="offcanvas__contact-icon mr-20">
                <span>
                  <Image src={contact_img} alt="contact_img" />
                </span>
              </div>
              <div className="offcanvas__contact-content">
                <h3 className="offcanvas__contact-title">
                  <a href="tel:098-852-987">004524865</a>
                </h3>
              </div>
            </div>
            <div className="offcanvas__btn">
              <Link href={getLocalizedLink("/contact")} onClick={() => setIsCanvasOpen(false)} className="tp-btn-2 tp-btn-border-2">{t('contact_us')}</Link>
            </div>
          </div>
          <div className="offcanvas__bottom">
            <div className="offcanvas__footer d-flex align-items-center justify-content-between">
              
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </div>
      {/* body overlay start */}
      <div onClick={() => setIsCanvasOpen(false)} className={`body-overlay ${isOffCanvasOpen ? 'opened' : ''}`}></div>
      {/* body overlay end */}
    </>
  );
};

export default OffCanvas;
