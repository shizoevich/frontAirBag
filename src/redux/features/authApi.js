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
  }),
});

export const {
  useLoginMutation,
  useRefreshTokenMutation,
  useVerifyTokenMutation,
} = authApi;
