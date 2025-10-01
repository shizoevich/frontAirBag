'use client';
import React, { useState } from "react";
import menu_data from "@/data/menu-data";
import Link from "next/link";
import Image from "next/image";
import { useTranslations, useLocale } from 'next-intl';
import { useSelector } from 'react-redux';
import { useLogoutMutation } from '@/redux/features/auth/authApi';
import { useGetShowCategoryQuery } from '@/redux/features/categoryApi';
import { useRouter } from 'next/navigation';

const Menus = () => {
  const t = useTranslations('menu');
  const locale = useLocale();
  const router = useRouter();
  const { user, accessToken, isGuest } = useSelector((state) => state.auth);
  const [logout] = useLogoutMutation();
  const [showAllBrands, setShowAllBrands] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState(null);
  
  // Load all categories to get car brands
  const { data: categoriesData } = useGetShowCategoryQuery();

  // Определяем статус пользователя для отображения соответствующих пунктов меню
  const isAuthenticated = !!accessToken;
  const isAuthenticatedUser = isAuthenticated && !isGuest;
  const isGuestOrUnauthenticated = !isAuthenticated || isGuest;

  // Обработка выхода из системы
  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      await logout().unwrap();
    } catch (error) {
      // Игнорируем ошибки сервера при logout
    }
    router.push(getLocalizedLink('/'));
  };

  // Фильтрация пунктов меню аккаунта в зависимости от статуса авторизации
  const filterAccountPages = (pages) => {
    return pages.filter(page => {
      if (page.showAlways) return true;
      if (page.showForGuests && isGuestOrUnauthenticated) return true;
      if (page.showForAuth && isAuthenticatedUser) return true;
      return false;
    });
  };

  // Get all car brands (subcategories of Covers - parent_id = 754099)
  const getAllCarBrands = () => {
    const allCategories = Array.isArray(categoriesData) 
      ? categoriesData 
      : Array.isArray(categoriesData?.data) 
        ? categoriesData.data 
        : Array.isArray(categoriesData?.results) 
          ? categoriesData.results 
          : [];
    
    return allCategories.filter(cat => 
      cat && String(cat.parent_id) === '754099'
    ).sort((a, b) => a.title.localeCompare(b.title));
  };

  // Функция для добавления локали к ссылкам (с защитой от не-строк)
  const getLocalizedLink = (link, context = 'Menus') => {
    try {
      if (typeof link !== 'string') {
        console.warn(`[getLocalizedLink] Non-string link in ${context}:`, link);
        return `/${locale}`;
      }
      if (link.startsWith('/')) {
        return `/${locale}${link}`;
      }
      return link;
    } catch (e) {
      console.warn(`[getLocalizedLink] Fallback in ${context}:`, e);
      return `/${locale}`;
    }
  };

  // Безопасная функция перевода: всегда возвращает строку
  const safeTranslate = (key) => {
    try {
      const result = t(key);
      return typeof result === 'string' ? result : key;
    } catch (error) {
      console.warn(`Translation error for key: ${key}`, error);
      return key;
    }
  };
  
  return (
    <ul style={{ display: 'flex', justifyContent: 'space-between', width: '100%', margin: 0, padding: 0 }}>
      {menu_data.map((menu) =>
        menu.homes ? (
          <li key={menu.id} className="has-dropdown has-mega-menu">
            <Link href={getLocalizedLink(menu.link)}>{menu.titleKey ? safeTranslate(menu.titleKey.replace('menu.', '')) : menu.title}</Link>
            <div className="home-menu tp-submenu tp-mega-menu">
              <div className="row row-cols-1 row-cols-lg-4 row-cols-xl-4">
                {menu.home_pages.map((home, i) => (
                  <div key={i} className="col">
                    <div className="home-menu-item">
                      <Link href={getLocalizedLink(home.link)}>
                        <div className="home-menu-thumb p-relative fix">
                          <Image src={home.img} alt="home img" />
                        </div>
                        <div className="home-menu-content">
                          <h5 className="home-menu-title">{home.title}</h5>
                        </div>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </li>
        ) : menu.products ? (
          <li key={menu.id} className="has-dropdown has-mega-menu">
            <Link href={getLocalizedLink(menu.link)}>{menu.titleKey ? safeTranslate(menu.titleKey.replace('menu.', '')) : menu.title}</Link>
            <div className="tp-submenu tp-mega-menu tp-mega-menu-wrapper p-relative" style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(3, 1fr)', 
              gap: '60px',
              padding: '40px 45px',
              borderRadius: '4px',
              boxShadow: '0 5px 20px rgba(0, 0, 0, 0.08)'
            }}>
              {menu.product_pages.map((p, i) => (
                <div key={i} className="mega-menu-column">
                  <h4 className="mega-menu-title" style={{ 
                    marginBottom: '15px', 
                    fontSize: '16px', 
                    fontWeight: '600',
                    color: '#222'
                  }}>
                    {p.titleKey ? t(p.titleKey.replace('menu.', '')) : p.title}
                  </h4>
                  <ul className="tp-submenu" style={{ marginLeft: '0' }}>
                    {p.mega_menus.map((m, i) => (
                      <li 
                        key={i} 
                        style={{ marginBottom: '8px', position: 'relative' }}
                        className={m.hasDropdown ? "has-dropdown-nested" : ""}
                      >
                        {m.hasDropdown ? (
                          <div
                            onMouseEnter={() => {
                              console.log('Mouse entered all brands');
                              if (hoverTimeout) {
                                clearTimeout(hoverTimeout);
                                setHoverTimeout(null);
                              }
                              setShowAllBrands(true);
                            }}
                            onMouseLeave={() => {
                              console.log('Mouse left all brands - setting timeout');
                              const timeout = setTimeout(() => {
                                console.log('Timeout executed - closing dropdown');
                                setShowAllBrands(false);
                              }, 300);
                              setHoverTimeout(timeout);
                            }}
                            style={{ position: 'relative' }}
                          >
                            <span
                              style={{ 
                                fontSize: '14px', 
                                color: '#666',
                                transition: 'color 0.3s ease',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px'
                              }}
                            >
                              {m.titleKey ? t(m.titleKey.replace('menu.', '')) : m.title}
                              <i className="fa fa-angle-right" style={{ fontSize: '12px' }}></i>
                            </span>
                            {(() => {
                              console.log('Rendering dropdown, showAllBrands:', showAllBrands);
                              return showAllBrands;
                            })() && (
                              <ul 
                                onMouseEnter={() => {
                                  console.log('Mouse entered dropdown list');
                                  if (hoverTimeout) {
                                    clearTimeout(hoverTimeout);
                                    setHoverTimeout(null);
                                  }
                                }}
                                onMouseLeave={() => {
                                  console.log('Mouse left dropdown list');
                                  const timeout = setTimeout(() => {
                                    setShowAllBrands(false);
                                  }, 300);
                                  setHoverTimeout(timeout);
                                }}
                                style={{
                                position: 'relative',
                                marginTop: '10px',
                                marginLeft: '0',
                                backgroundColor: '#f8f9fa',
                                border: '1px solid #ddd',
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                                borderRadius: '6px',
                                padding: '15px',
                                width: '100%',
                                maxHeight: '300px',
                                overflowY: 'auto',
                                display: 'grid',
                                gridTemplateColumns: 'repeat(2, 1fr)',
                                gap: '8px',
                                listStyle: 'none'
                              }}>
                                {getAllCarBrands().map((brand) => {
                                  const brandSlug = brand.title.toLowerCase()
                                    .replace(/\s+/g, '-')
                                    .replace(/[()]/g, '');
                                  const categorySlug = `${brandSlug}-${brand.id}`;
                                  return (
                                    <li key={brand.id} style={{ marginBottom: '0' }}>
                                      <Link 
                                        href={getLocalizedLink(`/shop/${categorySlug}`)}
                                        style={{ 
                                          fontSize: '13px', 
                                          color: '#666',
                                          transition: 'color 0.3s ease',
                                          whiteSpace: 'nowrap'
                                        }}
                                      >
                                        {brand.title}
                                      </Link>
                                    </li>
                                  );
                                })}
                              </ul>
                            )}
                          </div>
                        ) : (
                          <Link href={getLocalizedLink(m.link)} style={{ 
                            fontSize: '14px', 
                            color: '#666',
                            transition: 'color 0.3s ease'
                          }}>
                            {m.titleKey ? t(m.titleKey.replace('menu.', '')) : m.title}
                          </Link>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </li>
        ) : menu.user_account ? (
          <li key={menu.id} className="has-dropdown">
            <Link href={getLocalizedLink(menu.link)}>{menu.titleKey ? safeTranslate(menu.titleKey.replace('menu.', '')) : menu.title}</Link>
            <ul className="tp-submenu">
              {filterAccountPages(menu.account_pages).map((page, i) => (
                <li key={i}>
                  {page.titleKey === 'menu.logout' ? (
                    <a href="#" onClick={handleLogout} style={{ cursor: 'pointer' }}>
                      {safeTranslate(page.titleKey.replace('menu.', ''))}
                    </a>
                  ) : (
                    <Link href={getLocalizedLink(page.link)}>
                      {safeTranslate(page.titleKey.replace('menu.', ''))}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </li>
        ) : menu.sub_menu ? (
          <li key={menu.id} className="has-dropdown">
            <Link href={getLocalizedLink(menu.link)}>{menu.titleKey ? safeTranslate(menu.titleKey.replace('menu.', '')) : menu.title}</Link>
            <ul className="tp-submenu">
              {menu.sub_menus.map((b, i) => (
                <li key={i}>
                  <Link href={getLocalizedLink(b.link)}>{b.titleKey ? safeTranslate(b.titleKey.replace('menu.', '')) : b.title}</Link>
                </li>
              ))}
            </ul>
          </li>
        ) : (
          <li key={menu.id}>
            <Link href={getLocalizedLink(menu.link)}>{menu.titleKey ? safeTranslate(menu.titleKey.replace('menu.', '')) : menu.title}</Link>
          </li>
        )
      )}
    </ul>
  );
};

export default Menus;
