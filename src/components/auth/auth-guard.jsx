'use client';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { getAuth } from '@/utils/authStorage';
import Loader from '../loader/loader';

const AuthGuard = ({ children, requireAuth = true, redirectTo = null }) => {
  const router = useRouter();
  const locale = useLocale();
  const { accessToken, user } = useSelector((state) => state.auth);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Даем время AuthInitializer инициализировать состояние
    const initTimer = setTimeout(() => {
      setIsInitialized(true);
    }, 100);

    return () => clearTimeout(initTimer);
  }, []);

  useEffect(() => {
    // Проверяем авторизацию только после инициализации
    if (!isInitialized) return;

    const authData = getAuth();
    const isAuthenticated = authData?.accessToken || accessToken;
    const isAuthenticatedUser = isAuthenticated && user && !user.is_guest;

    if (requireAuth && !isAuthenticated) {
      // Сохраняем текущий URL для редиректа после логина
      const currentPath = window.location.pathname + window.location.search;
      localStorage.setItem('redirectAfterLogin', currentPath);
      
      const loginUrl = redirectTo || `/${locale}/login`;
      router.push(loginUrl);
      return;
    }

    // Если требуется полная авторизация (не гость), но пользователь гость
    if (requireAuth === 'user' && (!isAuthenticatedUser)) {
      const currentPath = window.location.pathname + window.location.search;
      localStorage.setItem('redirectAfterLogin', currentPath);
      
      const loginUrl = redirectTo || `/${locale}/login`;
      router.push(loginUrl);
      return;
    }
  }, [isInitialized, accessToken, user, router, locale, requireAuth, redirectTo]);

  // Показываем лоадер пока не инициализировались
  if (!isInitialized) {
    return <Loader loading={true} />;
  }

  // Проверяем авторизацию после инициализации
  const authData = getAuth();
  const isAuthenticated = authData?.accessToken || accessToken;
  
  if (requireAuth && !isAuthenticated) {
    return <Loader loading={true} />;
  }

  if (requireAuth === 'user' && (!user || user.is_guest)) {
    return <Loader loading={true} />;
  }

  return children;
};

export default AuthGuard;
