'use client';
import React, { useState, useMemo, useEffect } from "react";
import menu_data from "@/data/menu-data";
import Link from "next/link";
import { useTranslations, useLocale } from 'next-intl';
import { useSelector } from 'react-redux';
import { useLogoutMutation } from '@/redux/features/auth/authApi';
import { useGetCategoryTreeQuery } from '@/redux/features/categoryApi';
import { sortAlphabetically } from '@/utils/categoryTreeHelpers';
import { useRouter } from 'next/navigation';

const Menus = () => {
  const t = useTranslations('menu');
  const locale = useLocale();
  const router = useRouter();
  const { user, accessToken, isGuest } = useSelector((state) => state.auth);
  const [logout] = useLogoutMutation();
  const [catalogPath, setCatalogPath] = useState([]);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  
  // Загружаем дерево категорий
  const { data: categoryTree } = useGetCategoryTreeQuery();

  // Определяем статус пользователя
  const isAuthenticated = !!accessToken;
  const isAuthenticatedUser = isAuthenticated && !isGuest;
  const isGuestOrUnauthenticated = !isAuthenticated || isGuest;

  // Обработка выхода
  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      await logout().unwrap();
    } catch (error) {
      // Игнорируем ошибки
    }
    router.push(getLocalizedLink('/'));
  };

  // Фильтрация пунктов меню аккаунта
  const filterAccountPages = (pages) => {
    return pages.filter(page => {
      if (page.showAlways) return true;
      if (page.showForGuests && isGuestOrUnauthenticated) return true;
      if (page.showForAuth && isAuthenticatedUser) return true;
      return false;
    });
  };

  // Получаем отсортированные категории первого уровня
  const firstLevelCategories = useMemo(() => {
    if (!categoryTree) return [];
    return sortAlphabetically(categoryTree);
  }, [categoryTree]);

  // Функция для добавления локали к ссылкам
  const getLocalizedLink = (link) => {
    if (!link) return '#';
    if (typeof link !== 'string') return `/${locale}`;
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
      return key;
    }
  };

  // Handle chip click: navigate (via Link) + expand children if any
  const handleCatalogExpand = (cat, levelIndex) => {
    const isSame = catalogPath[levelIndex]?.id === cat.id;
    if (isSame) {
      setCatalogPath((prev) => prev.slice(0, levelIndex));
    } else {
      // Add to path (for leaves this won't produce a child row since children is empty)
      setCatalogPath((prev) => [...prev.slice(0, levelIndex), cat]);
    }
  };

  return (
    <ul style={{ display: 'flex', justifyContent: 'space-between', width: '100%', margin: 0, padding: 0 }}>
      {menu_data.map((menu) =>
        menu.products ? (
          <li key={menu.id} className="has-dropdown has-mega-menu" onMouseLeave={() => setCatalogPath([])}>
            <Link href={getLocalizedLink(menu.link)}>
              {menu.titleKey ? safeTranslate(menu.titleKey.replace('menu.', '')) : menu.title}
            </Link>
            <div
              className="tp-submenu tp-mega-menu tp-mega-menu-wrapper"
              style={{
                left: '0',
                right: '0',
                width: '100vw',
                marginLeft: 'calc(-50vw + 50%)',
                padding: '16px 40px 20px',
                boxShadow: '0 5px 20px rgba(0,0,0,0.08)',
                backgroundColor: '#fff',
                borderRadius: '0',
              }}
            >
              {mounted && (
                <>
                  {/* Level 0: root categories */}
                  <div className="tp-cat-chips-row tp-cat-chips-row--root">
                    {firstLevelCategories.map((cat) => {
                      const isSelected = catalogPath[0]?.id === cat.id;
                      const hasChildren = cat.children?.length > 0;
                      return (
                        <Link
                          key={cat.id}
                          href={getLocalizedLink(`/shop?category=${cat.id}`)}
                          className={`tp-cat-chip${isSelected ? ' tp-cat-chip--active' : ''}`}
                          onClick={() => handleCatalogExpand(cat, 0)}
                        >
                          <span className="tp-cat-chip__label">{cat.title}</span>
                          {hasChildren && (
                            <span className="tp-cat-chip__arrow">{isSelected ? '▴' : '▾'}</span>
                          )}
                        </Link>
                      );
                    })}
                  </div>

                  {/* Subcategory rows */}
                  {catalogPath.map((selected, idx) => {
                    const children = sortAlphabetically(selected.children || []);
                    if (!children.length) return null;
                    const levelIndex = idx + 1;
                    return (
                      <div key={selected.id} className="tp-cat-chips-row tp-cat-chips-row--sub">
                        {children.map((cat) => {
                          const isSelected = catalogPath[levelIndex]?.id === cat.id;
                          const hasChildren = cat.children?.length > 0;
                          return (
                            <Link
                              key={cat.id}
                              href={getLocalizedLink(`/shop?category=${cat.id}`)}
                              className={`tp-cat-chip${isSelected ? ' tp-cat-chip--active' : ''}`}
                              onClick={() => handleCatalogExpand(cat, levelIndex)}
                            >
                              <span className="tp-cat-chip__label">{cat.title}</span>
                              {hasChildren && (
                                <span className="tp-cat-chip__arrow">{isSelected ? '▴' : '▾'}</span>
                              )}
                            </Link>
                          );
                        })}
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          </li>
        ) : menu.user_account ? (
          <li key={menu.id} className="has-dropdown">
            <Link href={getLocalizedLink(menu.link)}>
              {menu.titleKey ? safeTranslate(menu.titleKey.replace('menu.', '')) : menu.title}
            </Link>
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
            <Link href={getLocalizedLink(menu.link)}>
              {menu.titleKey ? safeTranslate(menu.titleKey.replace('menu.', '')) : menu.title}
            </Link>
            <ul className="tp-submenu">
              {menu.sub_menus.map((b, i) => (
                <li key={i}>
                  <Link href={getLocalizedLink(b.link)}>
                    {b.titleKey ? safeTranslate(b.titleKey.replace('menu.', '')) : b.title}
                  </Link>
                </li>
              ))}
            </ul>
          </li>
        ) : (
          <li key={menu.id}>
            <Link href={getLocalizedLink(menu.link)}>
              {menu.titleKey ? safeTranslate(menu.titleKey.replace('menu.', '')) : menu.title}
            </Link>
          </li>
        )
      )}
    </ul>
  );
};

export default Menus;