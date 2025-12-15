'use client';
import React, {useState, useEffect} from "react";
import Image from "next/image";
import Link from "next/link";
import menu_data from "@/data/menu-data";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { closeCartMini } from "@/redux/features/cartSlice";
import { useTranslations, useLocale } from 'next-intl';
import { useLogoutMutation } from '@/redux/features/auth/authApi';
import { useGetShowCategoryQuery } from '@/redux/features/categoryApi';

const MobileMenus = ({setIsCanvasOpen}) => {
  const [isActiveMenu, setIsActiveMenu] = useState("");
  const [isActiveSubMenu, setIsActiveSubMenu] = useState("");
  const [isActiveBrandsMenu, setIsActiveBrandsMenu] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();
  const t = useTranslations('menu');
  const locale = useLocale();
  const { user, accessToken, isGuest } = useSelector((state) => state.auth);
  const [logout] = useLogoutMutation();
  
  // Load all categories to get car brands
  const { data: categoriesData } = useGetShowCategoryQuery();

  // Определяем статус пользователя для отображения соответствующих пунктов меню
  const isAuthenticated = !!accessToken;
  const isAuthenticatedUser = isAuthenticated && !isGuest;
  const isGuestOrUnauthenticated = !isAuthenticated || isGuest;

  // Функция для добавления локали к ссылкам
  const getLocalizedLink = (link) => {
    if (!link) return '#';
    if (link.startsWith('/')) {
      return `/${locale}${link}`;
    }
    return link;
  };

  // Безопасная функция перевода
  const safeTranslate = (key) => {
    try {
      const result = t(key);
      return typeof result === 'string' ? result : key;
    } catch (error) {
      console.warn(`Translation error for key: ${key}`, error);
      return key;
    }
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
    
    // Сортируем бренды: английский, кириллица, цифры
    return allCategories.filter(cat => 
      cat && String(cat.parent_id) === '754099'
    ).sort((a, b) => {
      const titleA = (a.title || '').trim();
      const titleB = (b.title || '').trim();
      
      // Определяем тип первого символа
      const getCharType = (str) => {
        const firstChar = str.charAt(0);
        if (/\d/.test(firstChar)) return 3; // Цифры
        if (/[а-яА-ЯіІїЇєЄґҐ]/.test(firstChar)) return 2; // Кириллица
        if (/[a-zA-Z]/.test(firstChar)) return 1; // Английский
        return 4; // Остальное
      };
      
      const typeA = getCharType(titleA);
      const typeB = getCharType(titleB);
      
      // Сначала сортируем по типу символа
      if (typeA !== typeB) return typeA - typeB;
      
      // Внутри одного типа - по алфавиту
      return titleA.toLowerCase().localeCompare(titleB.toLowerCase(), typeA === 2 ? 'uk' : 'en');
    });
  };

  // handleOpenSubMenu
  const handleOpenSubMenu = (title) => {
    if(title === isActiveMenu){
      setIsActiveMenu("")
    }
    else {
      setIsActiveMenu(title)
    }
  }

  // handleOpenNestedSubMenu
  const handleOpenNestedSubMenu = (title) => {
    if(title === isActiveSubMenu){
      setIsActiveSubMenu("")
    }
    else {
      setIsActiveSubMenu(title)
    }
  }

  // handleToggleBrandsMenu
  const handleToggleBrandsMenu = () => {
    setIsActiveBrandsMenu(!isActiveBrandsMenu);
  }
  
  // Handle navigation
  const handleNavigation = (link) => {
    setIsCanvasOpen(false); // Close mobile menu
    dispatch(closeCartMini()); // Close cart mini if open
    router.push(getLocalizedLink(link));
  }

  // Обработка выхода из системы
  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      await logout().unwrap();
    } catch (error) {
      // Игнорируем ошибки сервера при logout
    }
    setIsCanvasOpen(false);
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
  return (
    <>
      <nav className="tp-main-menu-content">
        <ul>
          {menu_data.map((menu) =>
            menu.homes ? (
              <li key={menu.id} className={`has-dropdown has-mega-menu ${isActiveMenu === menu.titleKey ? 'dropdown-opened':''}`}>
                <a className={`${isActiveMenu === menu.titleKey ? 'expanded':''}`}>
                  {menu.titleKey ? safeTranslate(menu.titleKey.replace('menu.', '')) : menu.title}
                  <button onClick={()=> handleOpenSubMenu(menu.titleKey)} className={`dropdown-toggle-btn ${isActiveMenu === menu.titleKey ? 'dropdown-opened':''}`}>
                    <i className="fa-regular fa-angle-right"></i>
                  </button>
                </a>
                <div className={`home-menu tp-submenu tp-mega-menu ${isActiveMenu === menu.titleKey ? 'active':''}`}>
                  <div className="row row-cols-1 row-cols-lg-4 row-cols-xl-5">
                    {menu.home_pages && menu.home_pages.map((home, i) => (
                      <div key={i} className="col">
                        <div className="home-menu-item">
                          <Link href={getLocalizedLink(home.link)} onClick={() => handleNavigation(home.link)}>
                            <div className="home-menu-thumb p-relative fix">
                              <Image src={home.img || '/assets/img/product/placeholder.jpg'} alt="home img" width={200} height={150} />
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
              <li key={menu.id} className={`has-dropdown ${isActiveMenu === menu.titleKey ? 'dropdown-opened':''}`}>
                <a className={`${isActiveMenu === menu.titleKey ? 'expanded':''}`}>
                  {menu.titleKey ? safeTranslate(menu.titleKey.replace('menu.', '')) : menu.title}
                  <button onClick={()=> handleOpenSubMenu(menu.titleKey)} className={`dropdown-toggle-btn ${isActiveMenu === menu.titleKey ? 'dropdown-opened':''}`}>
                    <i className="fa-regular fa-angle-right"></i>
                  </button>
                </a>
                <ul className={`tp-submenu ${isActiveMenu === menu.titleKey ? 'active':''}`}>
                  {menu.product_pages.map((p, i) => (
                    <li key={i} className={`has-dropdown ${isActiveSubMenu === p.titleKey ? 'dropdown-opened':''}`}>
                      <a className={`${isActiveSubMenu === p.titleKey ? 'expanded':''}`}>
                        {p.titleKey ? t(p.titleKey.replace('menu.', '')) : p.title}
                        {p.mega_menus && p.mega_menus.length > 0 && (
                          <button onClick={()=> handleOpenNestedSubMenu(p.titleKey)} className={`dropdown-toggle-btn ${isActiveSubMenu === p.titleKey ? 'dropdown-opened':''}`}>
                            <i className="fa-regular fa-angle-right"></i>
                          </button>
                        )}
                      </a>
                      {p.mega_menus && p.mega_menus.length > 0 && (
                        <ul className={`tp-submenu ${isActiveSubMenu === p.titleKey ? 'active':''}`}>
                          {p.mega_menus.map((subItem, subIndex) => (
                            subItem.hasDropdown ? (
                              <li key={subIndex} className={`has-dropdown ${isActiveBrandsMenu ? 'dropdown-opened':''}`}>
                                <a className={`${isActiveBrandsMenu ? 'expanded':''}`}>
                                  {subItem.titleKey ? t(subItem.titleKey.replace('menu.', '')) : subItem.title}
                                  <button onClick={handleToggleBrandsMenu} className={`dropdown-toggle-btn ${isActiveBrandsMenu ? 'dropdown-opened':''}`}>
                                    <i className="fa-regular fa-angle-right"></i>
                                  </button>
                                </a>
                                <ul className={`tp-submenu ${isActiveBrandsMenu ? 'active':''}`} style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                  {getAllCarBrands().map((brand) => (
                                    <li key={brand.id}>
                                      <Link href={getLocalizedLink(`/shop/${brand.slug}-${brand.id}`)} onClick={() => handleNavigation(`/shop/${brand.slug}-${brand.id}`)}>
                                        {brand.title}
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                              </li>
                            ) : (
                              <li key={subIndex}>
                                <Link href={getLocalizedLink(subItem.link)} onClick={() => handleNavigation(subItem.link)}>
                                  {subItem.titleKey ? t(subItem.titleKey.replace('menu.', '')) : subItem.title}
                                </Link>
                              </li>
                            )
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              </li>
            ) : menu.user_account ? (
              <li key={menu.id} className={`has-dropdown ${isActiveMenu === menu.titleKey ? 'dropdown-opened':''}`}>
                <a className={`${isActiveMenu === menu.titleKey ? 'expanded':''}`}>
                  {menu.titleKey ? safeTranslate(menu.titleKey.replace('menu.', '')) : menu.title}
                  <button onClick={()=> handleOpenSubMenu(menu.titleKey)} className={`dropdown-toggle-btn ${isActiveMenu === menu.titleKey ? 'dropdown-opened':''}`}>
                    <i className="fa-regular fa-angle-right"></i>
                  </button>
                </a>
                <ul className={`tp-submenu ${isActiveMenu === menu.titleKey ? 'active':''}`}>
                  {filterAccountPages(menu.account_pages).map((page, i) => (
                    <li key={i}>
                      {page.titleKey === 'menu.logout' ? (
                        <a href="#" onClick={handleLogout} style={{ cursor: 'pointer' }}>
                          {t(page.titleKey.replace('menu.', ''))}
                        </a>
                      ) : (
                        <Link href={getLocalizedLink(page.link)} onClick={() => handleNavigation(page.link)}>
                          {t(page.titleKey.replace('menu.', ''))}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </li>
            ) : menu.sub_menu ? (
              <li key={menu.id} className={`has-dropdown ${isActiveMenu === menu.titleKey ? 'dropdown-opened':''}`}>
                <a className={`${isActiveMenu === menu.titleKey ? 'expanded':''}`}>
                  {menu.titleKey ? safeTranslate(menu.titleKey.replace('menu.', '')) : menu.title}
                  <button onClick={()=> handleOpenSubMenu(menu.titleKey)} className={`dropdown-toggle-btn ${isActiveMenu === menu.titleKey ? 'dropdown-opened':''}`}>
                    <i className="fa-regular fa-angle-right"></i>
                  </button>
                </a>
                <ul className={`tp-submenu ${isActiveMenu === menu.titleKey ? 'active':''}`}>
                  {menu.sub_menus.map((b, i) => (
                    <li key={i}>
                      <Link href={getLocalizedLink(b.link)} onClick={() => handleNavigation(b.link)}>
                        {b.titleKey ? safeTranslate(b.titleKey.replace('menu.', '')) : b.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            ) : (
              <li key={menu.id}>
                <Link href={getLocalizedLink(menu.link)} onClick={() => handleNavigation(menu.link)}>
                  {menu.titleKey ? safeTranslate(menu.titleKey.replace('menu.', '')) : menu.title}
                </Link>
              </li>
            )
          )}
        </ul>
      </nav>
    </>
  );
};

export default MobileMenus;
