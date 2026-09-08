'use client';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { getAuth } from '@/utils/authStorage';
import Loader from '../loader/loader';

/**
 * Страницы только для вошедших: кабинет, заказы, профиль, чекаут.
 *
 * Аноним уводится на вход, а адрес запоминается — после входа вернём сюда.
 * Гостей нет (ADR-0021), поэтому `requireAuth="user"` и `requireAuth={true}`
 * означают одно и то же; старое написание оставлено ради вызывающего кода.
 */
const AuthGuard = ({ children, requireAuth = true, redirectTo = null }) => {
  const router = useRouter();
  const locale = useLocale();
  const { accessToken } = useSelector((state) => state.auth);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Даем время AuthInitializer инициализировать состояние
    const initTimer = setTimeout(() => {
      setIsInitialized(true);
    }, 100);

    return () => clearTimeout(initTimer);
  }, []);

  useEffect(() => {
    if (!isInitialized || !requireAuth) return;

    const isAuthenticated = getAuth()?.accessToken || accessToken;
    if (isAuthenticated) return;

    const currentPath = window.location.pathname + window.location.search;
    localStorage.setItem('redirectAfterLogin', currentPath);
    router.push(redirectTo || `/${locale}/login`);
  }, [isInitialized, accessToken, router, locale, requireAuth, redirectTo]);

  if (!isInitialized) {
    return <Loader loading={true} />;
  }

  const isAuthenticated = getAuth()?.accessToken || accessToken;
  if (requireAuth && !isAuthenticated) {
    return <Loader loading={true} />;
  }

  return children;
};

export default AuthGuard;
