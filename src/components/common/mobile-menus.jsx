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

const MobileMenus = ({setIsCanvasOpen}) => {
  const [isActiveMenu, setIsActiveMenu] = useState("");
  const router = useRouter();
  const dispatch = useDispatch();
  const t = useTranslations('menu');
  const locale = useLocale();
  const { user, accessToken, isGuest } = useSelector((state) => state.auth);
  const [logout] = useLogoutMutation();

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

  // handleOpenSubMenu
  const handleOpenSubMenu = (title) => {
    if(title === isActiveMenu){
      setIsActiveMenu("")
    }
    else {
      setIsActiveMenu(title)
    }
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
    router.push('/');
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
                  {menu.titleKey ? t(menu.titleKey.replace('menu.', '')) : menu.title}
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
                  {menu.titleKey ? t(menu.titleKey.replace('menu.', '')) : menu.title}
                  <button onClick={()=> handleOpenSubMenu(menu.titleKey)} className={`dropdown-toggle-btn ${isActiveMenu === menu.titleKey ? 'dropdown-opened':''}`}>
                    <i className="fa-regular fa-angle-right"></i>
                  </button>
                </a>
                <ul className={`tp-submenu ${isActiveMenu === menu.titleKey ? 'active':''}`}>
                  {menu.product_pages.map((p, i) => (
                    <li key={i}>
                      <Link href={getLocalizedLink(p.link)} onClick={() => handleNavigation(p.link)}>
                        {p.titleKey ? t(p.titleKey.replace('menu.', '')) : p.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            ) : menu.user_account ? (
              <li key={menu.id} className={`has-dropdown ${isActiveMenu === menu.titleKey ? 'dropdown-opened':''}`}>
                <a className={`${isActiveMenu === menu.titleKey ? 'expanded':''}`}>
                  {menu.titleKey ? t(menu.titleKey.replace('menu.', '')) : menu.title}
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
                  {menu.titleKey ? t(menu.titleKey.replace('menu.', '')) : menu.title}
                  <button onClick={()=> handleOpenSubMenu(menu.titleKey)} className={`dropdown-toggle-btn ${isActiveMenu === menu.titleKey ? 'dropdown-opened':''}`}>
                    <i className="fa-regular fa-angle-right"></i>
                  </button>
                </a>
                <ul className={`tp-submenu ${isActiveMenu === menu.titleKey ? 'active':''}`}>
                  {menu.sub_menus.map((b, i) => (
                    <li key={i}>
                      <Link href={getLocalizedLink(b.link)} onClick={() => handleNavigation(b.link)}>
                        {b.titleKey ? t(b.titleKey.replace('menu.', '')) : b.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            ) : (
              <li key={menu.id}>
                <Link href={getLocalizedLink(menu.link)} onClick={() => handleNavigation(menu.link)}>
                  {menu.titleKey ? t(menu.titleKey.replace('menu.', '')) : menu.title}
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
