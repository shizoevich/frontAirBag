'use client';
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import Image from "next/image";
import { useTranslations } from 'next-intl';
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
// internal
import useCartInfo from "@/hooks/use-cart-info";
import { openCartMini } from "@/redux/features/cartSlice";
import { useGetUserQuery } from "@/redux/features/auth/authApi";
import { userLoggedIn } from "@/redux/features/auth/authSlice";
import { CartTwo, Menu, User } from "@/svg";
import Cookies from "js-cookie";

const HeaderMainRight = ({ setIsCanvasOpen }) => {
  const t = useTranslations('HeaderMainRight');
  const { user: userInfo, accessToken, isGuest } = useSelector((state) => state.auth);
  const { quantity } = useCartInfo();
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split('/')[1]; // Получаем текущую локаль из URL
  
  // Проверяем, авторизован ли пользователь
  const isAuthenticated = !!accessToken;
  const isAuthenticatedUser = isAuthenticated && !isGuest;
  
  // Временно отключаем автозагрузку пользователя пока /auth/me/ не заработает
  const { data: userData, error: userError, isLoading: isLoadingUser } = useGetUserQuery(undefined, {
    skip: true // Отключено: endpoint /auth/me/ возвращает HTML вместо JSON
    // TODO: Включить когда бэкенд исправит endpoint
    // skip: !accessToken || !!userInfo
  });
  
  // Используем данные пользователя из Redux или из API запроса
  const currentUser = userInfo || userData;
  
  // Debug логи для отслеживания состояния пользователя
  console.log('HeaderMainRight: Auth state:', {
    isAuthenticated,
    isAuthenticatedUser,
    userInfo,
    userData,
    currentUser,
    accessToken: !!accessToken,
    rawAccessToken: accessToken,
    isGuest,
    userError,
    isLoadingUser,
    fullReduxState: { accessToken, user: userInfo, isGuest }
  });
  
  // Логируем ошибку получения пользователя
  if (userError) {
    console.error('❌ HeaderMainRight: Error loading user:', {
      status: userError?.status,
      data: userError?.data,
      message: userError?.data?.detail || userError?.message,
      fullError: userError
    });
  }
  
  // Дополнительная проверка localStorage
  if (typeof window !== 'undefined') {
    const localStorageData = localStorage.getItem('userInfo');
    console.log('HeaderMainRight: localStorage userInfo:', localStorageData);
  }

  
  // Handle cart button click
  const handleCartClick = () => {
    dispatch(openCartMini());
    console.log('Cart button clicked');
  };
  

  return (
    <div className="tp-header-main-right d-flex align-items-center justify-content-end">
      <div className="tp-header-login d-none d-lg-block">
        <div className="d-flex align-items-center">
          <div className="tp-header-login-icon">
            <span>
              {isAuthenticatedUser && currentUser?.imageURL ? (
                <Link href={`/${locale}/profile`}>
                  <Image
                    src={currentUser.imageURL}
                    alt="user img"
                    width={35}
                    height={35}
                    style={{ height: "auto" }}
                  />
                </Link>
              ) : isAuthenticatedUser && currentUser ? (
                <Link href={`/${locale}/profile`}>
                  <h2 className="text-uppercase login_text">
                    {(currentUser.email || currentUser.username || 'U')[0]}
                  </h2>
                </Link>
              ) : (
                <User />
              )}
            </span>
          </div>
          <div className="tp-header-login-content d-none d-xl-block">
            {!isAuthenticatedUser && (
              <Link href={`/${locale}/login`}>
                <span>{t('hello')}</span>
              </Link>
            )}
            {isAuthenticatedUser && currentUser && <span>{t('helloWithName', { name: currentUser.email || currentUser.username || 'User' })}</span>}
            <div className="tp-header-login-title">
              {!isAuthenticatedUser && <Link href={`/${locale}/login`}>{t('signIn')}</Link>}
              {isAuthenticatedUser && <Link href={`/${locale}/profile`}>{t('yourAccount')}</Link>}
            </div>
          </div>
        </div>
      </div>
      <div className="tp-header-action d-flex align-items-center ml-50">
        <div className="tp-header-action-item">
          <button
            onClick={handleCartClick}
            type="button"
            className="tp-header-action-btn cartmini-open-btn"
            aria-label={t('openCart')}
          >
            <CartTwo />
            <span className="tp-header-action-badge">{quantity}</span>
          </button>
        </div>
        <div className="tp-header-action-item d-lg-none">
          <button
            onClick={() => setIsCanvasOpen(true)}
            type="button"
            className="tp-header-action-btn tp-offcanvas-open-btn"
          >
            <Menu />
          </button>
        </div>
      </div>
    </div>
  );
};

export default HeaderMainRight;
