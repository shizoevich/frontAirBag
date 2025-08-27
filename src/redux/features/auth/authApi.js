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
        url: "/auth/logout/", // Эндпоинт для logout
        method: "POST",
      }),
      
      // Даже если запрос не удался, мы всё равно выполняем logout на клиенте
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        // Сначала очищаем клиентские данные
        Cookies.remove('userInfo');
        dispatch(userLoggedOut());
        
        try {
          await queryFulfilled;
          console.log('Server logout successful');
        } catch (err) {
          console.log('Server logout failed, but client logout completed:', err?.status || 'Unknown error');
          // Не показываем ошибку пользователю, так как клиентский logout уже выполнен
        }
      },
    }),
    
    // Регистрация пользователя
    register: builder.mutation({
      query: (data) => ({
        url: "/auth/register/",
        method: "POST",
        body: data,
      }),
      
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          const result = await queryFulfilled;
          console.log("Registration successful:", result);
          
          // Если была передана guest_id, это конверсия гостя в клиента
          if (arg.guest_id) {
            console.log("Guest-to-client conversion completed");
            
            // После конверсии нужно выполнить логин для получения новых токенов
            const loginResult = await dispatch(
              authApi.endpoints.login.initiate({
                email: arg.email,
                password: arg.password,
                remember: true,
              })
            ).unwrap();
            
            console.log("Post-conversion login successful:", loginResult);
          }
        } catch (err) {
          console.error('Registration error:', err);
        }
      },
    }),

    // Создание гостевого аккаунта
    createGuest: builder.mutation({
      query: (data) => ({
        url: "/auth/guest/", // Специальный эндпоинт для создания гостя
        method: "POST",
        body: {
          name: data.name || "Test",
          last_name: data.last_name || "Guest",
          phone: data.phone || "",
          nova_post_address: data.nova_post_address || ""
        },
      }),
      
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          const result = await queryFulfilled;
          console.log("Guest creation successful:", result);
          
          // Ожидаем, что эндпоинт /auth/guest/ вернет токены напрямую
          const { access, refresh, guest_id } = result.data;
          
          if (access && refresh) {
            // Сохраняем гостевые токены
            const guestData = {
              accessToken: access,
              refreshToken: refresh,
              isGuest: true,
              guestId: guest_id,
            };
            
            Cookies.set(
              "userInfo",
              JSON.stringify(guestData),
              { expires: 365 } // Гостевые токены на год (бессрочные refresh)
            );
            
            console.log("Guest tokens saved:", guestData);
            
            // Обновляем состояние Redux
            dispatch(
              userLoggedIn({
                accessToken: access,
                user: null, // Гость не имеет полных данных пользователя
                isGuest: true,
                guestId: guest_id,
              })
            );
            
            console.log("Guest state updated in Redux");
          } else {
            throw new Error("Гостевые токены не были получены");
          }

        } catch (err) {
          console.error('Guest creation error:', err);
          console.error('Error details:', {
            message: err?.message,
            status: err?.status,
            data: err?.data
          });
          throw err;
        }
      },
    }),
    // Обновление профиля пользователя
    updateProfile: builder.mutation({
      query: (data) => ({
        url: "/auth/me/",
        method: "PATCH",
        body: data,
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
          console.error('Update profile error:', err);
        }
      },
      invalidatesTags: ['User'],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterUserMutation,
  useCreateGuestMutation,
  useGetUserQuery,
  useRefreshTokenMutation,
  useVerifyTokenMutation,
  useLogoutMutation,
  useUpdateProfileMutation,
} = authApi;
