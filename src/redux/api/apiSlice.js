import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { userLoggedOut } from "../features/auth/authSlice";
import { getAccessToken, getRefreshToken, setAuth, getAuth } from "@/utils/authStorage";

function isAccessTokenExpiredError(result) {
  const status = result?.error?.status;
  const data = result?.error?.data;

  if (status === 401) return true;

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
  prepareHeaders: async (headers, { endpoint }) => {
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
      ]);

      if (endpoint && publicEndpoints.has(endpoint)) {
        headers.delete('Authorization');
        return headers;
      }

      // Prefer localStorage token
      let token = getAccessToken();

      // Fallback to cookie token (some environments block localStorage or it may be stale)
      if (!token) {
        try {
          if (typeof window !== 'undefined') {
            // eslint-disable-next-line global-require
            const Cookies = require('js-cookie');
            const cookieRaw = Cookies.get('userInfo');
            if (cookieRaw) {
              const parsed = JSON.parse(cookieRaw);
              token = parsed?.accessToken || null;
            }
          }
        } catch {
          // ignore cookie parse errors
        }
      }

      if (token) headers.set('Authorization', `Bearer ${token}`);
    } catch (error) {
      console.error('Error reading auth from storage:', error);
    }
    return headers;
  },
});

// Создаем обертку для базового запроса с обработкой ошибок и обновлением токенов
const baseQueryWithReauth = async (args, api, extraOptions) => {
  console.log('🌐 API Request:', { 
    url: typeof args === 'string' ? args : args.url,
    method: typeof args === 'string' ? 'GET' : args.method 
  });
  
  let result = await baseQuery(args, api, extraOptions);
  
  console.log('🌐 API Response:', { 
    url: typeof args === 'string' ? args : args.url,
    status: result?.error?.status || result?.meta?.response?.status || 'success',
    hasData: !!result?.data,
    hasError: !!result?.error,
    data: result?.data,
    error: result?.error
  });
  
  // If access token expired/invalid, try refresh and retry
  if (isAccessTokenExpiredError(result)) {
    // Проверяем, есть ли refresh токен
    try {
      const userInfo = getAuth() || {};
      const refreshToken = getRefreshToken();
      
      if (!refreshToken) {
        // Если нет refresh токена, выполняем logout
        api.dispatch(userLoggedOut());
        return result;
      }
      
      // Пытаемся обновить access токен
      const refreshResult = await baseQuery(
        { url: '/auth/token/refresh/', method: 'POST', body: { refresh: refreshToken } },
        api,
        extraOptions
      );
      
      if (refreshResult?.data) {
        // Сохраняем новый access токен
        const { access } = refreshResult.data;
        
        // Обновляем токены в localStorage
        setAuth({ ...userInfo, accessToken: access });
        // Keep cookie in sync for middleware/initializer
        syncCookieAccessToken(access);
        
        // Повторяем исходный запрос с новым токеном
        result = await baseQuery(args, api, extraOptions);
      } else {
        // Если не удалось обновить токен, выполняем logout
        api.dispatch(userLoggedOut());
      }
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
