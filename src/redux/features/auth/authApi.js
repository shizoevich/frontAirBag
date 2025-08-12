import { apiSlice } from "@/redux/api/apiSlice";
import { userLoggedIn, userLoggedOut } from "./authSlice";
import Cookies from "js-cookie";

export const authApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    // Авторизация пользователя
    login: builder.mutation({
      query: (data) => ({
        url: "/auth/login/",
        method: "POST",
        body: data,
      }),

      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          const result = await queryFulfilled;
          
          // Сохраняем токены в cookie
          const { access, refresh } = result.data;
          
          // Устанавливаем срок хранения в зависимости от флага remember
          const expiresInDays = arg.remember ? 30 : 1;
          
          Cookies.set(
            "userInfo",
            JSON.stringify({
              accessToken: access,
              refreshToken: refresh
            }),
            { expires: expiresInDays }
          );

          // Диспатчим действие для обновления состояния
          dispatch(
            userLoggedIn({
              accessToken: access,
            })
          );
          
          // После успешного логина получаем данные пользователя
          dispatch(authApi.endpoints.getUser.initiate());
        } catch (err) {
          console.error('Login error:', err);
        }
      },
    }),
    
    // Получение данных пользователя
    getUser: builder.query({
      query: () => ({
        url: "/auth/me/",
        method: "GET",
      }),

      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          const result = await queryFulfilled;
          
          // Обновляем данные пользователя в store
          dispatch(
            userLoggedIn({
              user: result.data,
            })
          );
        } catch (err) {
          console.error('Get user error:', err);
          // Если ошибка 401, выполняем logout
          if (err?.error?.status === 401) {
            dispatch(userLoggedOut());
          }
        }
      },
      providesTags: ['User'],
    }),
    
    // Обновление access токена
    refreshToken: builder.mutation({
      query: (refreshToken) => ({
        url: "/auth/token/refresh/",
        method: "POST",
        body: { refresh: refreshToken },
      }),

      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          const result = await queryFulfilled;
          
          // Получаем новый access токен
          const { access } = result.data;
          
          // Обновляем токены в cookie
          const userInfo = JSON.parse(Cookies.get('userInfo') || '{}');
          
          Cookies.set(
            "userInfo",
            JSON.stringify({
              ...userInfo,
              accessToken: access,
            }),
            { expires: 7 }
          );

          // Обновляем токен в store
          dispatch(
            userLoggedIn({
              accessToken: access,
            })
          );
        } catch (err) {
          console.error('Refresh token error:', err);
          // Если ошибка с refresh токеном, выполняем logout
          dispatch(userLoggedOut());
        }
      },
    }),
    
    // Проверка валидности токена
    verifyToken: builder.mutation({
      query: (token) => ({
        url: "/auth/token/verify/",
        method: "POST",
        body: { token },
      }),
    }),
    
    // Выход пользователя
    logout: builder.mutation({
      query: () => ({
        url: "/auth/logout/", // Если есть такой эндпоинт
        method: "POST",
      }),
      
      // Даже если запрос не удался, мы всё равно выполняем logout на клиенте
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          await queryFulfilled;
        } catch (err) {
          console.error('Logout error:', err);
        } finally {
          // В любом случае удаляем токены и данные пользователя
          Cookies.remove('userInfo');
          dispatch(userLoggedOut());
        }
      },
    }),
    
    // Регистрация пользователя (если нужно)
    registerUser: builder.mutation({
      query: (data) => ({
        url: "/auth/register/", // Укажите правильный эндпоинт для регистрации
        method: "POST",
        body: data,
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterUserMutation,
  useGetUserQuery,
  useRefreshTokenMutation,
  useVerifyTokenMutation,
  useLogoutMutation,
} = authApi;
