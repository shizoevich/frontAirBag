import { createListenerMiddleware } from '@reduxjs/toolkit';
import Cookies from 'js-cookie';
import { userLoggedOut, userLoggedIn } from '../features/auth/authSlice';

// Middleware для автоматического обновления токенов
export const authMiddleware = createListenerMiddleware();

// Функция для проверки и обновления токена
const refreshTokenIfNeeded = async (dispatch, getState) => {
  const { auth } = getState();
  const userInfo = Cookies.get('userInfo');
  
  if (!userInfo) {
    dispatch(userLoggedOut());
    return;
  }

  try {
    const { accessToken, refreshToken } = JSON.parse(userInfo);
    
    if (!accessToken || !refreshToken) {
      dispatch(userLoggedOut());
      return;
    }

    // Проверяем, не истек ли access токен
    const tokenPayload = JSON.parse(atob(accessToken.split('.')[1]));
    const currentTime = Date.now() / 1000;
    
    // Если токен истекает в течение 5 минут, обновляем его
    if (tokenPayload.exp - currentTime < 300) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/token/refresh/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refresh: refreshToken }),
        });

        if (response.ok) {
          const data = await response.json();
          
          // Обновляем токены в cookie
          Cookies.set(
            'userInfo',
            JSON.stringify({
              accessToken: data.access,
              refreshToken: refreshToken, // refresh токен остается тем же
            }),
            { expires: 7 }
          );

          // Обновляем состояние
          dispatch(userLoggedIn({
            accessToken: data.access,
          }));
        } else {
          // Если не удалось обновить токен, выполняем logout
          dispatch(userLoggedOut());
        }
      } catch (error) {
        console.error('Token refresh failed:', error);
        dispatch(userLoggedOut());
      }
    }
  } catch (error) {
    console.error('Error parsing user info:', error);
    dispatch(userLoggedOut());
  }
};

// Слушатель для инициализации аутентификации при загрузке приложения
authMiddleware.startListening({
  predicate: (action, currentState, previousState) => {
    // Запускаем проверку при инициализации store или при изменении состояния auth
    return action.type === '@@INIT' || 
           (previousState?.auth?.accessToken !== currentState?.auth?.accessToken);
  },
  effect: async (action, listenerApi) => {
    await refreshTokenIfNeeded(listenerApi.dispatch, listenerApi.getState);
  },
});

// Периодическая проверка токенов (каждые 10 минут)
setInterval(() => {
  if (typeof window !== 'undefined') {
    const store = require('../store').store;
    if (store) {
      refreshTokenIfNeeded(store.dispatch, store.getState);
    }
  }
}, 10 * 60 * 1000); // 10 минут
