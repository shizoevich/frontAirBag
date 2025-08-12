import Cookies from "js-cookie";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { userLoggedOut } from "../features/auth/authSlice";

// Логируем базовый URL для отладки
console.log('API Base URL:', process.env.NEXT_PUBLIC_API_BASE_URL);

// Создаем базовый запрос с обработкой токенов
const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
  prepareHeaders: async (headers, { getState, endpoint }) => {
    try {
      const userInfo = Cookies.get('userInfo');
      if (userInfo) {
        const user = JSON.parse(userInfo);
        if (user?.accessToken) {
          headers.set("Authorization", `Bearer ${user.accessToken}`);
        }
      }
    } catch (error) {
      console.error('Error parsing user info:', error);
    }
    return headers;
  },
});

// Создаем обертку для базового запроса с обработкой ошибок и обновлением токенов
const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);
  
  // Если получаем ошибку 401 (токен истек), пробуем обновить токен
  if (result?.error?.status === 401) {
    // Проверяем, есть ли refresh токен
    try {
      const userInfo = JSON.parse(Cookies.get('userInfo') || '{}');
      const refreshToken = userInfo.refreshToken;
      
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
        
        // Обновляем токены в cookie
        Cookies.set(
          "userInfo",
          JSON.stringify({
            ...userInfo,
            accessToken: access,
          }),
          { expires: 7 }
        );
        
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
    "ClientUpdates", "Discounts", "BotVisitors", "Templates", "allProducts"
  ]
});