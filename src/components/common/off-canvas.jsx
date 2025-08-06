'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
// internal
import { CloseTwo } from '@/svg';
import logo from '@assets/img/logo/logo.svg';
import contact_img from '@assets/img/icon/contact.png';
import MobileCategory from '@/layout/headers/header-com/mobile-category';
import MobileMenus from './mobile-menus';
import LanguageSwitcher from './language-switcher'; // Импортируем новый компонент

const OffCanvas = ({ isOffCanvasOpen, setIsCanvasOpen }) => {
  const t = useTranslations('OffCanvas');
  const [isCategoryActive, setIsCategoryActive] = useState(false);
  const router = useRouter();
  
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
                <div className="offcanvas__logo logo">
                  <Link href="/" onClick={() => setIsCanvasOpen(false)}>
                    <Image src={logo} alt="logo" />
                  </Link>
                </div>
              </div>
            </div>
            <div className="offcanvas__category pb-40">
              <button onClick={() => setIsCategoryActive(!isCategoryActive)} className="tp-offcanvas-category-toggle">
                <i className="fa-solid fa-bars"></i>
                {t('all_categories')}
              </button>
              <div className="tp-category-mobile-menu">
                <nav className={`tp-category-menu-content ${isCategoryActive ? "active" : ""}`}>
                  {/* Убрали передачу categoryType */}
                  <MobileCategory isCategoryActive={isCategoryActive} />
                </nav>
              </div>
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
              <Link href="/contact" onClick={() => setIsCanvasOpen(false)} className="tp-btn-2 tp-btn-border-2">{t('contact_us')}</Link>
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
