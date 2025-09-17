'use client';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { userLoggedIn, userLoggedOut } from '@/redux/features/auth/authSlice';
import { getAuth } from '@/utils/authStorage';
import Cookies from 'js-cookie';

const AuthInitializer = ({ children }) => {
  const dispatch = useDispatch();
  const [isInitialized, setIsInitialized] = useState(false);
  const { accessToken } = useSelector((state) => state.auth);

  useEffect(() => {
    const initializeAuth = () => {
      try {
        // Убеждаемся, что мы на клиенте
        if (typeof window === 'undefined') {
          setIsInitialized(true);
          return;
        }

        // Пытаемся получить данные из cookie (основной источник), затем из localStorage (fallback)
        const cookieRaw = Cookies.get('userInfo');
        const cookieData = cookieRaw ? JSON.parse(cookieRaw) : null;
        const lsData = getAuth();
        const authData = cookieData || lsData;

        console.log('AuthInitializer: Cookie userInfo:', cookieData);
        console.log('AuthInitializer: LocalStorage userInfo:', lsData);
        console.log('AuthInitializer: Using authData source:', cookieData ? 'cookie' : (lsData ? 'localStorage' : 'none'));
        console.log('AuthInitializer: Current Redux accessToken:', accessToken);
        
        if (authData && authData.accessToken) {
          console.log('AuthInitializer: Found valid auth data, initializing Redux state');
          console.log('AuthInitializer: Dispatching userLoggedIn with:', {
            accessToken: !!authData.accessToken,
            user: !!authData.user,
            isGuest: authData.isGuest,
            guestId: authData.guestId
          });
          // Инициализируем состояние из cookies/localStorage
          dispatch(userLoggedIn({
            accessToken: authData.accessToken,
            user: authData.user || null,
            isGuest: authData.isGuest || false,
            guestId: authData.guestId || null
          }));
        } else {
          console.log('AuthInitializer: No valid auth data found');
          console.log('AuthInitializer: authData exists:', !!authData);
          console.log('AuthInitializer: accessToken exists:', !!(authData && authData.accessToken));
          // Очищаем состояние, если нет данных в localStorage
          if (accessToken) {
            console.log('AuthInitializer: Clearing stale Redux state');
            dispatch(userLoggedOut());
          }
        }
        
        setIsInitialized(true);
      } catch (error) {
        console.error('Error initializing auth:', error);
        setIsInitialized(true);
      }
    };

    // Инициализируем сразу, без задержки
    initializeAuth();
  }, [dispatch, accessToken]);

  // Синхронизация состояния при изменениях
  useEffect(() => {
    if (!isInitialized) return;

    const handleStorageChange = () => {
      console.log('AuthInitializer: Storage changed, re-initializing...');
      const authData = getAuth();
      
      if (authData && authData.accessToken) {
        dispatch(userLoggedIn({
          accessToken: authData.accessToken,
          user: authData.user || null,
          isGuest: authData.isGuest || false,
          guestId: authData.guestId || null
        }));
      } else if (accessToken) {
        dispatch(userLoggedOut());
      }
    };

    // Слушаем изменения localStorage
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [dispatch, accessToken, isInitialized]);

  return children;
};

export default AuthInitializer;
