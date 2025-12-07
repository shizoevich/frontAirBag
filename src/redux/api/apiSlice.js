import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { userLoggedOut } from "../features/auth/authSlice";
import { getAccessToken, getRefreshToken, setAuth, getAuth } from "@/utils/authStorage";

// Логируем базовый URL для отладки
console.log('API Base URL:', process.env.NEXT_PUBLIC_API_BASE_URL);

// Создаем базовый запрос с обработкой токенов
const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
  prepareHeaders: async (headers) => {
    try {
      const token = getAccessToken();
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
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
  
  // Если получаем ошибку 401 (токен истек), пробуем обновить токен
  if (result?.error?.status === 401) {
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
    "ClientUpdates", "Discounts", "BotVisitors", "Templates", "allProducts", "BoughtTogetherProducts"
  ]
});