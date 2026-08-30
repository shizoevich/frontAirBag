import { createListenerMiddleware } from '@reduxjs/toolkit';
import Cookies from 'js-cookie';
import { userLoggedOut, userLoggedIn } from '../features/auth/authSlice';

// Middleware для автоматического обновления токенов
export const authMiddleware = createListenerMiddleware();

// Функция для проверки и обновления токена
//
// Слушатель ниже срабатывает на любое изменение auth.accessToken — то есть и в
// момент успешного входа. Поэтому здесь нельзя разлогинивать из-за того, что
// не удалось прочитать хранилище: в WebView Telegram Desktop cookie не ставятся,
// и вход снимался сам собой сразу после выдачи токена.
//
// Разлогин теперь наступает только когда обновление токена действительно
// провалилось. Если хранилище недоступно, ничего не делаем: токен живёт в
// памяти, а протухнет — baseQueryWithReauth поймает 401 и разберётся.
const readStoredSession = (getState) => {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('userInfo') : null;
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.accessToken) return parsed;
    }
  } catch {
    // хранилище недоступно — идём дальше
  }

  try {
    const cookieRaw = Cookies.get('userInfo');
    if (cookieRaw) {
      const parsed = JSON.parse(cookieRaw);
      if (parsed?.accessToken) return parsed;
    }
  } catch {
    // повреждённый cookie — идём дальше
  }

  // Последний источник: состояние в памяти. Его положил успешный вход.
  const accessToken = getState()?.auth?.accessToken || null;
  return accessToken ? { accessToken, refreshToken: null } : null;
};

const refreshTokenIfNeeded = async (dispatch, getState) => {
  const session = readStoredSession(getState);
  if (!session?.accessToken) return;

  let tokenPayload;
  try {
    tokenPayload = JSON.parse(atob(session.accessToken.split('.')[1]));
  } catch (error) {
    console.error('Error parsing access token:', error);
    return;
  }

  const currentTime = Date.now() / 1000;
  // Обновляем заранее, за пять минут до истечения.
  if (tokenPayload.exp - currentTime >= 300) return;

  // Без refresh-токена обновлять нечем. Разлогинивать тоже не за что: истёкший
  // access упрётся в 401, и там уже отработает общая ветка.
  if (!session.refreshToken) return;

  try {
    const base = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!base) {
      console.error('NEXT_PUBLIC_API_BASE_URL is not set, skipping token refresh');
      return;
    }

    const response = await fetch(`${base}/auth/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: session.refreshToken }),
    });

    if (!response.ok) {
      // Refresh отвергнут — сессия действительно недействительна.
      dispatch(userLoggedOut());
      return;
    }

    const data = await response.json();

    // Обновлять надо оба хранилища. Если писать только в cookie, localStorage
    // остаётся со старым токеном на исходе — и следующая же проверка снова
    // пойдёт обновлять, зациклив запросы.
    const updated = JSON.stringify({ ...session, accessToken: data.access });
    try {
      Cookies.set('userInfo', updated, { expires: 7 });
    } catch {
      // cookie недоступны
    }
    try {
      if (typeof window !== 'undefined') localStorage.setItem('userInfo', updated);
    } catch {
      // localStorage недоступен
    }

    dispatch(userLoggedIn({ accessToken: data.access }));
  } catch (error) {
    // Сеть могла отвалиться на секунду — это не повод выкидывать пользователя.
    console.error('Token refresh failed:', error);
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
