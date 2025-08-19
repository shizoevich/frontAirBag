import { apiSlice } from "../api/apiSlice";

export const authApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    // Вход в систему
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login/',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['User'],
    }),

    // Обновление токена
    refreshToken: builder.mutation({
      query: (refreshToken) => ({
        url: '/auth/token/refresh/',
        method: 'POST',
        body: { refresh: refreshToken },
      }),
    }),

    // Проверка токена
    verifyToken: builder.mutation({
      query: (token) => ({
        url: '/auth/token/verify/',
        method: 'POST',
        body: { token },
      }),
    }),

    // Получение информации о текущем пользователе
    getMe: builder.query({
      query: () => '/auth/me/',
      providesTags: ['User'],
    }),
  }),
});

export const {
  useLoginMutation,
  useRefreshTokenMutation,
  useVerifyTokenMutation,
  useGetMeQuery,
} = authApi;
