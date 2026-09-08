'use client';
import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { userLoggedIn, userLoggedOut } from '@/redux/features/auth/authSlice';
import { useTelegramAutoLinkMutation } from '@/redux/features/auth/authApi';
import {
  readTelegramInitData,
  readTelegramInitDataUnsafe,
  hasTelegramInitData,
  buildTelegramInitPayload,
  getTelegramUser,
} from '@/utils/telegram';
import { getAuth, isStorageWritable } from '@/utils/authStorage';
import Cookies from 'js-cookie';

const AuthInitializer = ({ children }) => {
  const dispatch = useDispatch();
  const [isInitialized, setIsInitialized] = useState(false);
  const { accessToken } = useSelector((state) => state.auth);
  const autoLinkAttempted = useRef(false);

  const [telegramAutoLink] = useTelegramAutoLinkMutation();

  // Восстановление состояния из хранилища. Порядок тот же, что в authSlice:
  // localStorage — источник правды, cookie — зеркало.
  useEffect(() => {
    const initializeAuth = () => {
      try {
        if (typeof window === 'undefined') {
          setIsInitialized(true);
          return;
        }

        const lsData = getAuth();
        let cookieData = null;
        try {
          const cookieRaw = Cookies.get('userInfo');
          cookieData = cookieRaw ? JSON.parse(cookieRaw) : null;
        } catch {
          cookieData = null;
        }
        const authData = lsData?.accessToken ? lsData : cookieData;

        if (authData && authData.accessToken) {
          dispatch(userLoggedIn({
            accessToken: authData.accessToken,
            user: authData.user || null,
          }));
        } else {
          // Разлогинивать можно, только если хранилище рабочее и в нём правда
          // пусто. В WebView Telegram Desktop оно недоступно, и без этой
          // проверки эффект срабатывал на появление токена в Redux после
          // успешного входа и тут же его снимал: тост показан, редиректа нет,
          // а следующий запрос уходил без заголовка авторизации.
          if (accessToken && isStorageWritable()) {
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

  // Мини-апп открыт под аккаунтом, к которому этот Telegram ещё не привязан
  // (вошли по почте на сайте, потом открыли бота) — привязываем без вопросов.
  // Сам вход по Telegram при открытии делает useAuthCheck.
  useEffect(() => {
    if (!isInitialized) return;
    if (autoLinkAttempted.current) return;

    const attemptAutoLink = () => {
      if (autoLinkAttempted.current) return;

      const rawInitData = readTelegramInitData();
      const initDataUnsafe = readTelegramInitDataUnsafe();
      if (!hasTelegramInitData(rawInitData, initDataUnsafe)) return;

      const currentAuth = getAuth();
      if (!currentAuth?.accessToken) return;

      const webAppUserId = Number(getTelegramUser()?.id);
      const linked = (currentAuth?.user?.telegram_ids || []).map(Number);
      if (!webAppUserId || linked.includes(webAppUserId)) return;

      const payload = buildTelegramInitPayload({ rawInitData });
      if (!payload) return;

      autoLinkAttempted.current = true;
      telegramAutoLink(payload).catch((err) => {
        console.warn('AuthInitializer: Telegram auto-link failed', err);
      });
    };

    attemptAutoLink();

    if (!autoLinkAttempted.current) {
      window.addEventListener('telegram-webapp-loaded', attemptAutoLink, { once: true });
      return () => window.removeEventListener('telegram-webapp-loaded', attemptAutoLink);
    }
  }, [isInitialized, telegramAutoLink]);

  // Cross-tab storage sync
  useEffect(() => {
    if (!isInitialized) return;

    const handleStorageChange = () => {
      const authData = getAuth();

      if (authData && authData.accessToken) {
        dispatch(userLoggedIn({
          accessToken: authData.accessToken,
          user: authData.user || null,
        }));
      } else if (accessToken && isStorageWritable()) {
        // Та же оговорка, что и в инициализации: пустое хранилище означает
        // разлогин только тогда, когда хранилище вообще работает.
        dispatch(userLoggedOut());
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [dispatch, accessToken, isInitialized]);

  return children;
};

export default AuthInitializer;
