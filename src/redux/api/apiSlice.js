import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { userLoggedIn, userLoggedOut } from "../features/auth/authSlice";
import { getAccessToken, getRefreshToken, setAuth, getAuth } from "@/utils/authStorage";
import { readTelegramInitData } from "@/utils/telegram";

function decodeJwtPayload(token) {
  try {
    if (!token || typeof token !== 'string') return null;
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const payload = parts[1]
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    const normalized = payload + '='.repeat((4 - (payload.length % 4)) % 4);
    const decoded = atob(normalized);
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

function getTokenMeta(token, source) {
  const payload = decodeJwtPayload(token);
  return {
    token,
    source,
    exp: payload?.exp || 0,
    userId: payload?.user_id || null,
  };
}

function resolveBestAccessToken() {
  let localToken = null;
  let cookieToken = null;

  try {
    localToken = getAccessToken();
  } catch {
    localToken = null;
  }

  try {
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line global-require
      const Cookies = require('js-cookie');
      const cookieRaw = Cookies.get('userInfo');
      if (cookieRaw) {
        const parsed = JSON.parse(cookieRaw);
        cookieToken = parsed?.accessToken || null;
      }
    }
  } catch {
    cookieToken = null;
  }

  const localMeta = getTokenMeta(localToken, 'localStorage');
  const cookieMeta = getTokenMeta(cookieToken, 'cookie');

  // Prefer the token with the latest exp to avoid stale-token 403 loops.
  let selected = null;
  if (localMeta.token && cookieMeta.token) {
    selected = localMeta.exp >= cookieMeta.exp ? localMeta : cookieMeta;
  } else {
    selected = localMeta.token ? localMeta : cookieMeta;
  }

  return {
    selected,
    localMeta,
    cookieMeta,
  };
}

function isAccessTokenExpiredError(result) {
  const status = result?.error?.status;
  const data = result?.error?.data;

  if (status === 401) return true;

  if (status === 403 && data?.code === 'user_not_found') {
    return true;
  }

  // Пароль сменили (в том числе через восстановление) — выданные ранее токены
  // больше не принимаются. Возвращаем true, чтобы сработала общая ветка:
  // попытка refresh тоже упрётся в password_changed, и пользователя разлогинит.
  if ((status === 401 || status === 403) && data?.code === 'password_changed') {
    return true;
  }

  // Some backends return 403 with { code: 'token_not_valid', messages: [{ message: 'Token is expired' }] }
  if (status === 403 && data && typeof data === 'object') {
    if (data.code === 'token_not_valid') {
      const messages = Array.isArray(data.messages) ? data.messages : [];
      const hasExpired = messages.some((m) => String(m?.message || '').toLowerCase().includes('expired'));
      return hasExpired || true;
    }
  }

  return false;
}

function syncCookieAccessToken(accessToken) {
  try {
    if (typeof window === 'undefined') return;
    // Lazy import to avoid issues in non-browser contexts
    // eslint-disable-next-line global-require
    const Cookies = require('js-cookie');
    const existingRaw = Cookies.get('userInfo');
    const existing = existingRaw ? JSON.parse(existingRaw) : {};
    Cookies.set(
      'userInfo',
      JSON.stringify({
        ...existing,
        accessToken,
      }),
      { expires: 7 }
    );
  } catch (e) {
    // ignore cookie sync failures
  }
}

// Логируем базовый URL для отладки
console.log('API Base URL:', process.env.NEXT_PUBLIC_API_BASE_URL);

// Создаем базовый запрос с обработкой токенов
const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
  prepareHeaders: async (headers, { endpoint, getState }) => {
    headers.set('ngrok-skip-browser-warning', '1');
    try {
      // Public endpoints should not send Authorization at all.
      // Sending an expired token can make some backends return 401 even for public resources.
      const publicEndpoints = new Set([
        // products / categories / discounts
        'getAllProducts',
        'getAllProductsNoLimit',
        'getProductsByCategory',
        'getProductsByIds',
        'getProductsByMultipleIds',
        'getFeaturedProducts',
        'searchProducts',
        'getCategoryTree',
        'getCategoryBySlug',
        'getCategoryById',
        'getShowCategory',
        'getProductsByCategoryId',
        'getDiscounts',
        'getDiscountById',
        // восстановление пароля: пользователь здесь заведомо разлогинен, а
        // протухший токен увёл бы baseQueryWithReauth в разлогин на 401
        'requestPasswordReset',
        'confirmPasswordReset',
        // подтверждение почты: пользователь ещё не залогинен
        'confirmEmail',
        'resendEmailConfirmation',
        // вход по Telegram: сюда приходят как раз с мёртвым токеном
        'telegramAuth',
      ]);

      if (endpoint && publicEndpoints.has(endpoint)) {
        headers.delete('Authorization');
        return headers;
      }

      const { selected, localMeta, cookieMeta } = resolveBestAccessToken();

      if (selected?.token) {
        headers.set('Authorization', `Bearer ${selected.token}`);

        // Keep storage and cookie in sync to avoid repeated stale-token selection.
        try {
          const existing = getAuth() || {};
          if (existing?.accessToken !== selected.token) {
            setAuth({ ...existing, accessToken: selected.token });
          }
        } catch {
          // ignore sync failures
        }
        syncCookieAccessToken(selected.token);

        console.log('🔐 prepareHeaders auth token selected:', {
          endpoint,
          source: selected.source,
          selectedExp: selected.exp,
          selectedUserId: selected.userId,
          localUserId: localMeta.userId,
          localExp: localMeta.exp,
          cookieUserId: cookieMeta.userId,
          cookieExp: cookieMeta.exp,
        });
      } else {
        // Хранилище может быть недоступно — так ведёт себя WebView Telegram
        // Desktop. Токен при этом лежит в Redux: его положил успешный вход.
        // Без этого отката запрос уходил без заголовка, и бэкенд отвечал 403
        // «Authentication credentials were not provided».
        const reduxToken = getState()?.auth?.accessToken || null;
        if (reduxToken) {
          headers.set('Authorization', `Bearer ${reduxToken}`);
          console.log('🔐 prepareHeaders: хранилище пусто, взят токен из Redux', { endpoint });
        } else {
          console.log('🔐 prepareHeaders auth token missing:', { endpoint });
        }
      }
    } catch (error) {
      console.error('Error reading auth from storage:', error);
    }
    return headers;
  },
});

// Запросы без Authorization: сюда нельзя тащить протухший токен из хранилища.
const publicBaseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
  prepareHeaders: (headers) => {
    headers.set('ngrok-skip-browser-warning', '1');
    return headers;
  },
});

/**
 * Сессия умерла, но мы внутри мини-аппа — входим по Telegram заново.
 *
 * Так сессия переживает истечение refresh без перезапуска мини-аппа: раньше
 * фронт разлогинивал, чекаут заводил гостя, и заказ падал в 403 четыре раза
 * подряд (Сидоренко, 05.09.2026). Неизвестный Telegram (404) или протухший
 * initData (400) — честный разлогин.
 */
export async function loginViaTelegram(api, extraOptions) {
  const initData = readTelegramInitData();
  if (!initData) return false;

  const result = await publicBaseQuery(
    { url: '/telegram/auth', method: 'POST', body: { init_data: initData } },
    api,
    extraOptions
  );
  const { access, refresh, user } = result?.data || {};
  if (!access) return false;

  setAuth({ accessToken: access, refreshToken: refresh ?? null, user: user || null });
  syncCookieAccessToken(access);
  api.dispatch(userLoggedIn({ accessToken: access, user: user || null }));
  return true;
}

// Сами точки входа/обновления сессии повторному входу не подлежат — иначе цикл.
function isSessionEndpoint(url) {
  return typeof url === 'string' && (url.includes('/telegram/auth') || url.includes('/auth/token/refresh/'));
}

// Создаем обертку для базового запроса с обработкой ошибок и обновлением токенов
export const baseQueryWithReauth = async (args, api, extraOptions) => {
  const reqUrl = typeof args === 'string' ? args : args.url;
  const reqMethod = typeof args === 'string' ? 'GET' : args.method;
  console.log('🌐 API Request:', { 
    url: reqUrl,
    method: reqMethod 
  });
  
  let result = await baseQuery(args, api, extraOptions);
  
  const resStatus = result?.error?.status || result?.meta?.response?.status || 'success';
  console.log('🌐 API Response:', { 
    url: reqUrl,
    status: resStatus,
    hasData: !!result?.data,
    hasError: !!result?.error,
    data: result?.data,
    error: result?.error
  });

  if (reqUrl?.includes('/payments/') && reqMethod?.toUpperCase() === 'POST') {
    console.log('💳 Payment POST summary:', {
      url: reqUrl,
      status: resStatus,
      ok: !result?.error,
    });
  }
  
  // Токен истёк: сначала refresh, затем — в мини-аппе — вход по Telegram, и
  // только потом разлогин. Удачное восстановление повторяет исходный запрос.
  if (isAccessTokenExpiredError(result) && !isSessionEndpoint(reqUrl)) {
    try {
      const userInfo = getAuth() || {};
      const refreshToken = getRefreshToken();
      let restored = false;

      if (refreshToken) {
        console.log('🔁 Refresh token request: /auth/token/refresh/');
        const refreshResult = await baseQuery(
          { url: '/auth/token/refresh/', method: 'POST', body: { refresh: refreshToken } },
          api,
          extraOptions
        );
        const access = refreshResult?.data?.access;
        if (access) {
          setAuth({ ...userInfo, accessToken: access });
          syncCookieAccessToken(access);
          restored = true;
        }
      }

      if (!restored) {
        restored = await loginViaTelegram(api, extraOptions);
      }

      if (!restored) {
        api.dispatch(userLoggedOut());
        return result;
      }

      result = await baseQuery(args, api, extraOptions);
    } catch (error) {
      console.error('Token refresh error:', error);
      api.dispatch(userLoggedOut());
    }
  }

  return result;
};

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({}),
  tagTypes: [
    "Products", "Coupon", "Product", "RelatedProducts", "UserOrder", 
    "UserOrders", "ProductType", "OfferProducts", "PopularProducts", 
    "products", "productCategories", "Orders", "Carts", "FeaturedProducts", "NewArrivals",
    "categories", "User", "CartItems", "OrderItems", "OrderUpdates", "Clients", 
    "ClientUpdates", "Discounts", "BotVisitors", "Templates", "allProducts", "BoughtTogetherProducts",
    "CategoryTree", "AllProducts", "SearchResults"
  ]
});
