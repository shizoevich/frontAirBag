'use client';
import React, {useState, useMemo} from "react";
import Link from "next/link";
import menu_data from "@/data/menu-data";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { closeCartMini } from "@/redux/features/cartSlice";
import { useTranslations, useLocale } from 'next-intl';
import { useLogoutMutation } from '@/redux/features/auth/authApi';
import { useGetCategoryTreeQuery } from '@/redux/features/categoryApi';
import { sortAlphabetically } from '@/utils/categoryTreeHelpers';

const MobileMenus = ({setIsCanvasOpen}) => {
  const [isActiveMenu, setIsActiveMenu] = useState("");
  const [activeSubMenus, setActiveSubMenus] = useState({}); // Изменено для поддержки множественных уровней
  const router = useRouter();
  const dispatch = useDispatch();
  const t = useTranslations('menu');
  const locale = useLocale();
  const { user, accessToken, isGuest } = useSelector((state) => state.auth);
  const [logout] = useLogoutMutation();
  
  // Загружаем дерево категорий
  const { data: categoryTree } = useGetCategoryTreeQuery();

  const isAuthenticated = !!accessToken;
  const isAuthenticatedUser = isAuthenticated && !isGuest;
  const isGuestOrUnauthenticated = !isAuthenticated || isGuest;

  const getLocalizedLink = (link) => {
    if (!link) return '#';
    if (link.startsWith('/')) {
      return `/${locale}${link}`;
    }
    return link;
  };

  // Получаем отсортированные категории первого уровня
  const firstLevelCategories = useMemo(() => {
    if (!categoryTree) return [];
    return sortAlphabetically(categoryTree);
  }, [categoryTree]);

  const filterAccountPages = (pages) => {
    return pages.filter(page => {
      if (page.showAlways) return true;
      if (page.showForGuests && isGuestOrUnauthenticated) return true;
      if (page.showForAuth && isAuthenticatedUser) return true;
      return false;
    });
  };

  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      await logout().unwrap();
    } catch (error) {
      // Игнорируем ошибки
    }
    setIsCanvasOpen(false);
    router.push(getLocalizedLink('/'));
  };

  const handleOpenMenu = (menu) => {
    if(menu === isActiveMenu){
      setIsActiveMenu("")
      setActiveSubMenus({}); // Сбрасываем все подменю
    }
    else {
      setIsActiveMenu(menu)
      setActiveSubMenus({}); // Сбрасываем все подменю при открытии нового меню
    }
  }

  const handleToggleSubMenu = (categoryId) => {
    setActiveSubMenus(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  }
  
  const handleNavigation = (link) => {
    setIsCanvasOpen(false);
    dispatch(closeCartMini());
    router.push(getLocalizedLink(link));
  }

  // Рекурсивный компонент для отображения категорий любого уровня
  const CategoryMenuItem = ({ category, level = 0 }) => {
    const hasChildren = category.children && category.children.length > 0;
    const isOpen = activeSubMenus[category.id];
    const sortedChildren = hasChildren ? sortAlphabetically(category.children) : [];

    if (!hasChildren) {
      // Конечная категория без детей
      return (
        <li key={category.id}>
          <Link 
            href={getLocalizedLink(`/shop?category=${category.id}`)} 
            onClick={() => handleNavigation(`/shop?category=${category.id}`)}
          >
            {category.title}
          </Link>
        </li>
      );
    }

    // Категория с детьми
    return (
      <li key={category.id} className={`has-dropdown ${isOpen ? 'dropdown-opened':''}`}>
        <a className={`${isOpen ? 'expanded':''}`}>
          {category.title}
          <button 
            onClick={() => handleToggleSubMenu(category.id)} 
            className={`dropdown-toggle-btn ${isOpen ? 'dropdown-opened':''}`}
          >
            <i className="fa-regular fa-angle-right"></i>
          </button>
        </a>
        <ul className={`tp-submenu ${isOpen ? 'active':''}`}>
          {sortedChildren.map((child) => (
            <CategoryMenuItem key={child.id} category={child} level={level + 1} />
          ))}
        </ul>
      </li>
    );
  };

  return (
    <nav className="tp-main-menu-content">
      {menu_data.map((menu, i) => (
        <React.Fragment key={i}>
          {menu.products && (
            <ul>
              <li className={`has-dropdown ${isActiveMenu === menu.titleKey ? 'dropdown-opened':''}`}>
                <a className={`${isActiveMenu === menu.titleKey ? 'expanded':''}`}>
                  {menu.titleKey ? t(menu.titleKey.replace('menu.', '')) : menu.title}
                  <button onClick={()=> handleOpenMenu(menu.titleKey)} className={`dropdown-toggle-btn ${isActiveMenu === menu.titleKey ? 'dropdown-opened':''}`}>
                    <i className="fa-regular fa-angle-right"></i>
                  </button>
                </a>
                <ul className={`tp-submenu ${isActiveMenu === menu.titleKey ? 'active':''}`}>
                  {/* Рекурсивное отображение всех уровней категорий */}
                  {firstLevelCategories.map((category) => (
                    <CategoryMenuItem key={category.id} category={category} level={0} />
                  ))}
                </ul>
              </li>
            </ul>
          )}

          {menu.user_account && (
            <ul>
              <li className={`has-dropdown ${isActiveMenu === menu.titleKey ? 'dropdown-opened':''}`}>
                <a className={`${isActiveMenu === menu.titleKey ? 'expanded':''}`}>
                  {menu.titleKey ? t(menu.titleKey.replace('menu.', '')) : menu.title}
                  <button onClick={()=> handleOpenMenu(menu.titleKey)} className={`dropdown-toggle-btn ${isActiveMenu === menu.titleKey ? 'dropdown-opened':''}`}>
                    <i className="fa-regular fa-angle-right"></i>
                  </button>
                </a>
                <ul className={`tp-submenu ${isActiveMenu === menu.titleKey ? 'active':''}`}>
                  {filterAccountPages(menu.account_pages).map((item, i) => (
                    <li key={i}>
                      {item.titleKey === 'menu.logout' ? (
                        <a href="#" onClick={handleLogout}>
                          {t(item.titleKey.replace('menu.', ''))}
                        </a>
                      ) : (
                        <Link href={getLocalizedLink(item.link)} onClick={() => handleNavigation(item.link)}>
                          {t(item.titleKey.replace('menu.', ''))}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </li>
            </ul>
          )}

          {menu.single_link && (
            <ul>
              <li>
                <Link href={getLocalizedLink(menu.link)} onClick={() => handleNavigation(menu.link)}>
                  {menu.titleKey ? t(menu.titleKey.replace('menu.', '')) : menu.title}
                </Link>
              </li>
            </ul>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default MobileMenus;