'use client';
import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { userLoggedIn, userLoggedOut } from '@/redux/features/auth/authSlice';
import { useTelegramAuthMutation, useTelegramAutoLinkMutation } from '@/redux/features/auth/authApi';
import {
  readTelegramInitData,
  readTelegramInitDataUnsafe,
  hasTelegramInitData,
  buildTelegramInitPayload,
} from '@/utils/telegram';
import { getAuth } from '@/utils/authStorage';
import Cookies from 'js-cookie';

const AuthInitializer = ({ children }) => {
  const dispatch = useDispatch();
  const [isInitialized, setIsInitialized] = useState(false);
  const { accessToken } = useSelector((state) => state.auth);
  const telegramAttempted = useRef(false);

  const [telegramAuth] = useTelegramAuthMutation();
  const [telegramAutoLink] = useTelegramAutoLinkMutation();

  // Basic auth initialization from storage/cookies
  useEffect(() => {
    const initializeAuth = () => {
      try {
        if (typeof window === 'undefined') {
          setIsInitialized(true);
          return;
        }

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
          dispatch(userLoggedIn({
            accessToken: authData.accessToken,
            user: authData.user || null,
            isGuest: authData.isGuest || false,
            guestId: authData.guestId || null,
          }));
        } else {
          console.log('AuthInitializer: No valid auth data found');
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

    initializeAuth();
  }, [dispatch, accessToken]);

  // Telegram WebApp auto-auth / auto-link
  useEffect(() => {
    if (!isInitialized) return;
    if (telegramAttempted.current) return;

    const attemptTelegramAuth = () => {
      if (telegramAttempted.current) return;

      const rawInitData = readTelegramInitData();
      const initDataUnsafe = readTelegramInitDataUnsafe();
      if (!hasTelegramInitData(rawInitData, initDataUnsafe)) return;

      telegramAttempted.current = true;

      const payload = buildTelegramInitPayload({ rawInitData });
      if (!payload) return;

      // Read fresh auth state from storage to avoid stale closure values
      const currentAuth = getAuth();
      const currentAccessToken = currentAuth?.accessToken || null;
      const currentTelegramId = currentAuth?.user?.telegram_id ?? null;

      if (!currentAccessToken) {
        console.log('AuthInitializer: Attempting Telegram auto-auth');
        telegramAuth(payload).catch((err) => {
          console.warn('AuthInitializer: Telegram auto-auth failed', err);
        });
      } else if (!currentTelegramId) {
        console.log('AuthInitializer: Attempting Telegram auto-link');
        telegramAutoLink(payload).catch((err) => {
          console.warn('AuthInitializer: Telegram auto-link failed', err);
        });
      }
    };

    // Attempt immediately (SDK may already be available)
    attemptTelegramAuth();

    // Also listen for async SDK load if not yet attempted
    if (!telegramAttempted.current) {
      window.addEventListener('telegram-webapp-loaded', attemptTelegramAuth, { once: true });
      return () => window.removeEventListener('telegram-webapp-loaded', attemptTelegramAuth);
    }
  }, [isInitialized, telegramAuth, telegramAutoLink]);

  // Cross-tab storage sync
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
          guestId: authData.guestId || null,
        }));
      } else if (accessToken) {
        dispatch(userLoggedOut());
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [dispatch, accessToken, isInitialized]);

  return children;
};

export default AuthInitializer;
