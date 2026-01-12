'use client';
import React, { useState, useMemo } from "react";
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
  const [expandedCategories, setExpandedCategories] = useState({});
  
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

  // Переключение раскрытия категории
  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  // Рекурсивный компонент для отображения категории
  const CategoryItem = ({ category, level = 0 }) => {
    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = expandedCategories[category.id];
    const sortedChildren = hasChildren ? sortAlphabetically(category.children) : [];

    if (!hasChildren) {
      // Конечная категория без детей
      return (
        <li style={{ marginBottom: '8px' }}>
          <Link 
            href={getLocalizedLink(`/shop?category=${category.id}`)}
            style={{ 
              fontSize: '14px', 
              color: '#666',
              transition: 'color 0.3s ease',
              display: 'block'
            }}
          >
            {category.title}
          </Link>
        </li>
      );
    }

    // Категория с детьми
    return (
      <li style={{ marginBottom: level === 0 ? '20px' : '12px' }}>
        <div
          onClick={() => toggleCategory(category.id)}
          style={{
            fontSize: level === 0 ? '16px' : '14px',
            fontWeight: level === 0 ? '600' : '500',
            color: level === 0 ? '#222' : '#444',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '8px',
            transition: 'color 0.3s ease'
          }}
        >
          <span style={{ 
            fontSize: '12px', 
            color: '#999',
            minWidth: '12px'
          }}>
            {isExpanded ? '−' : '+'}
          </span>
          {category.title}
        </div>
        {isExpanded && (
          <ul style={{ 
            marginLeft: level === 0 ? '20px' : '15px',
            listStyle: 'none',
            padding: 0
          }}>
            {sortedChildren.map((child) => (
              <CategoryItem key={child.id} category={child} level={level + 1} />
            ))}
          </ul>
        )}
      </li>
    );
  };

  return (
    <ul style={{ display: 'flex', justifyContent: 'space-between', width: '100%', margin: 0, padding: 0 }}>
      {menu_data.map((menu) =>
        menu.products ? (
          <li key={menu.id} className="has-dropdown has-mega-menu">
            <Link href={getLocalizedLink(menu.link)}>
              {menu.titleKey ? safeTranslate(menu.titleKey.replace('menu.', '')) : menu.title}
            </Link>
            <div 
              className="tp-submenu tp-mega-menu tp-mega-menu-wrapper p-relative" 
              style={{ 
                left: '0',
                right: '0',
                width: '100vw',
                marginLeft: 'calc(-50vw + 50%)',
                display: 'grid', 
                gridTemplateColumns: 'repeat(3, 1fr)', 
                gap: '40px',
                padding: '30px 60px',
                borderRadius: '0',
                boxShadow: '0 5px 20px rgba(0, 0, 0, 0.08)',
                backgroundColor: '#fff'
              }}
            >
              {firstLevelCategories.map((category) => (
                <div key={category.id} className="mega-menu-column">
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    <CategoryItem category={category} level={0} />
                  </ul>
                </div>
              ))}
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