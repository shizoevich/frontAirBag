import { apiSlice } from "@/redux/api/apiSlice";
import { userLoggedIn, userLoggedOut } from "./authSlice";
import { setAuth, updateAuth, removeAuth, getAuth } from "@/utils/authStorage";
import { decodeJWT, getUserIdFromToken } from "@/utils/jwtDecode";
import Cookies from "js-cookie";

function isBlankString(v) {
  return v === undefined || v === null || String(v).trim() === "";
}

function normalizeGuestClientPayload(input) {
  const data = input || {};

  const name = isBlankString(data.name) ? "" : String(data.name).trim();
  const last_name = isBlankString(data.last_name) ? "" : String(data.last_name).trim();
  const phone = isBlankString(data.phone) ? "" : String(data.phone).trim();

  const payload = {
    name,
    last_name,
    phone,
  };

  // Optional fields (send only when non-empty)
  if (!isBlankString(data.nova_post_address)) {
    payload.nova_post_address = String(data.nova_post_address).trim();
  }
  if (!isBlankString(data.title)) {
    payload.title = String(data.title).trim();
  }
  if (!isBlankString(data.login)) {
    payload.login = String(data.login).trim();
  }
  if (!isBlankString(data.email)) {
    payload.email = String(data.email).trim();
  }
  if (data.telegram_id !== undefined && data.telegram_id !== null && data.telegram_id !== "") {
    const tg = Number(data.telegram_id);
    if (Number.isFinite(tg)) payload.telegram_id = Math.trunc(tg);
  }

  // Validation (based on backend schema)
  const errors = {};
  if (isBlankString(payload.name)) errors.name = { code: "required" };
  if (isBlankString(payload.last_name)) errors.last_name = { code: "required" };
  if (isBlankString(payload.phone)) errors.phone = { code: "required" };

  if (payload.name && payload.name.length > 255) errors.name = { code: "maxLength", max: 255 };
  if (payload.last_name && payload.last_name.length > 255) errors.last_name = { code: "maxLength", max: 255 };
  if (payload.phone && payload.phone.length > 20) errors.phone = { code: "maxLength", max: 20 };
  if (payload.login && payload.login.length > 128) errors.login = { code: "maxLength", max: 128 };
  if (payload.email && payload.email.length > 100) errors.email = { code: "maxLength", max: 100 };

  // Lightweight phone validation (backend may be stricter)
  if (payload.phone && !/^[\+]?[- 0-9()]+$/.test(payload.phone)) {
    errors.phone = { code: "invalidPhone" };
  }

  // Lightweight email validation
  if (payload.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
    errors.email = { code: "invalidEmail" };
  }

  if (payload.telegram_id !== undefined) {
    // Backend int64 range from swagger
    const min = -9223372036854776000;
    const max = 9223372036854776000;
    if (!Number.isInteger(payload.telegram_id)) errors.telegram_id = { code: "integer" };
    else if (payload.telegram_id < min || payload.telegram_id > max) errors.telegram_id = { code: "outOfRange" };
  }

  return {
    payload,
    errors,
    isValid: Object.keys(errors).length === 0,
  };
}

function normalizeGuestCreateResponse(data) {
  // Backend responses can vary. Supported shapes:
  // 1) { access, refresh, guest_id }
  // 2) { client_id, tokens: { access, refresh } }
  // 3) { tokens: { access, refresh }, guest_id|client_id }
  const access = data?.access || data?.tokens?.access;
  const refresh = data?.refresh || data?.tokens?.refresh;
  const guest_id = data?.guest_id ?? data?.client_id ?? data?.id ?? null;
  return { access, refresh, guest_id };
}

export const authApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    // Авторизация пользователя
    login: builder.mutation({
      query: (data) => {
        const payload = {
          // Many backends accept either email or username; include both for compatibility
          email: data.email,
          username: data.email,
          password: data.password,
        };
        return {
          url: "/auth/login/",
          method: "POST",
          body: payload,
        };
      },

      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        console.log('🔧 LOGIN API: onQueryStarted called with arg:', arg);
        try {
          console.log('🔧 LOGIN API: Waiting for queryFulfilled...');
          const result = await queryFulfilled;
          console.log('🔧 LOGIN API: queryFulfilled resolved, result:', result);
          console.log('Login successful, received tokens:', { access: !!result.data.access, refresh: !!result.data.refresh });
          
          // Сохраняем токены в localStorage (без cookies)
          const { access, refresh } = result.data;
          
          // Извлекаем user_id из токена
          const tokenPayload = decodeJWT(access);
          const userId = tokenPayload?.user_id;
          console.log('Decoded token payload:', { userId, exp: tokenPayload?.exp });
          
          // Создаем минимальный объект пользователя из токена
          const minimalUser = userId ? {
            id: userId,
            email: arg.email, // Используем email из формы логина
          } : null;
          
          setAuth({ 
            accessToken: access, 
            refreshToken: refresh,
            user: minimalUser 
          });
          console.log('Tokens and minimal user data saved to localStorage');

          // Диспатчим действие для обновления состояния с данными пользователя
          dispatch(
            userLoggedIn({
              accessToken: access,
              user: minimalUser,
            })
          );
          console.log('Redux state updated with access token and minimal user data');
          
          // Синхронизируем cookie для совместимости с authMiddleware и initialState
          try {
            Cookies.set(
              'userInfo',
              JSON.stringify({
                accessToken: access,
                refreshToken: refresh,
                user: minimalUser, // Сохраняем минимальные данные пользователя
              }),
              { expires: 7 }
            );
            console.log('Cookies userInfo set (tokens + minimal user)');
          } catch (cookieErr) {
            console.error('Failed to set cookies userInfo after login:', cookieErr);
          }
          
          // Временно отключено: /auth/me/ возвращает HTML вместо JSON
          // TODO: Включить когда бэкенд исправит endpoint
          /*
          try {
            console.log('Fetching user data...');
            const userResult = await dispatch(authApi.endpoints.getUser.initiate()).unwrap();
            console.log('User data loaded successfully:', userResult);
          } catch (userError) {
            console.error('Failed to load user data after login:', userError);
          }
          */
          console.log('⚠️ Skipping /auth/me/ - endpoint returns HTML instead of JSON');
        } catch (err) {
          console.log('🔧 LOGIN API: queryFulfilled rejected, error:', err);
          // RTK Query may attach the error under err.error or err.data
          const status = err?.error?.status ?? err?.status;
          const data = err?.error?.data ?? err?.data;
          const message = data?.detail || data?.message || err?.error || err?.message || 'Unknown error';
          console.error('🔧 LOGIN API: Login error details:', { status, data, message, fullError: err });
          console.error('Login error:', { status, data, message });
        }
      },
    }),
    
    // Получение данных пользователя
    getUser: builder.query({
      query: () => {
        console.log('🔍 GET USER: Making request to /auth/me/');
        return {
          url: "/auth/me/",
          method: "GET",
        };
      },
      // Guard against non-JSON/HTML and transform arrays
      transformResponse: (response) => {
        console.log('🔍 GET USER: Raw response:', response);
        // Some environments can return HTML; do not crash the app.
        if (typeof response === 'string' && response.trim().startsWith('<')) {
          return null;
        }
        // Если ответ - массив, берем первый элемент
        if (Array.isArray(response) && response.length > 0) {
          console.log('✅ Transformed array response to single user object');
          return response[0];
        }
        return response;
      },

      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          console.log('🔍 GET USER: Waiting for response...');
          const result = await queryFulfilled;
          console.log('✅ GetUser successful, received user data:', result.data);
          
          // Получаем текущие данные из localStorage для сохранения токена
          const existing = getAuth();
          console.log('Current auth data in localStorage:', existing);
          
          // Обновляем данные пользователя в store с сохранением токена
          dispatch(
            userLoggedIn({
              accessToken: existing?.accessToken || null, // Сохраняем токен
              user: result.data,
              isGuest: result.data.is_guest || false,
              guestId: result.data.guest_id || null,
            })
          );
          console.log('Redux state updated with user data and token');
          
          // Обновляем localStorage с полной информацией о пользователе
          if (existing) {
            try {
              const updatedData = {
                user: result.data,
                isGuest: result.data.is_guest || false,
                guestId: result.data.guest_id || null,
              };
              updateAuth(updatedData);
              console.log('Updated localStorage with user data:', updatedData);
              
              // Проверяем, что данные действительно сохранились
              const verifyData = getAuth();
              console.log('Verification - auth data after update:', verifyData);
            } catch (storageError) {
              console.error('Error updating local auth with user data:', storageError);
            }
          } else {
            console.warn('No existing auth data found in localStorage during user data update');
          }

          // Синхронизируем cookie userInfo с полным набором данных (tokens + user)
          try {
            const cookieExisting = Cookies.get('userInfo');
            const cookieTokens = cookieExisting ? JSON.parse(cookieExisting) : {};
            Cookies.set(
              'userInfo',
              JSON.stringify({
                accessToken: cookieTokens.accessToken || existing?.accessToken || null,
                refreshToken: cookieTokens.refreshToken || null,
                user: result.data,
                isGuest: result.data.is_guest || false,
                guestId: result.data.guest_id || null,
              }),
              { expires: 7 }
            );
            console.log('Cookies userInfo updated with user data');
          } catch (cookieErr) {
            console.error('Failed to update cookies userInfo after getUser:', cookieErr);
          }
        } catch (err) {
          // Игнорируем ошибки отмены запроса
          if (err?.name === 'AbortError' || err?.message?.includes('aborted')) {
            console.log('ℹ️ GET USER request was aborted');
            return;
          }
          
          
          // Если ошибка 401, выполняем logout
          if (err?.error?.status === 401 || err?.status === 401) {
            console.warn('⚠️ 401 Unauthorized - logging out user');
            dispatch(userLoggedOut());
          } else if (err?.error || err?.status) {
            console.warn('⚠️ GET USER failed but not 401, keeping user logged in with token only');
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
          const userInfo = getAuth() || {};
          setAuth({ ...userInfo, accessToken: access });

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
        removeAuth();
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
          // RTK Query errors can look empty in console due to non-enumerable props.
          const status = err?.error?.status ?? err?.status;
          const data = err?.error?.data ?? err?.data;
          const message = data?.detail || data?.message || err?.error || err?.message || 'Unknown error';
          console.error('Registration error (details):', {
            status,
            message,
            data,
            raw: err,
          });
        }
      },
    }),

    // Создание гостевого аккаунта
    createGuest: builder.mutation({
      // Use queryFn to validate & normalize payload BEFORE request
      async queryFn(arg, api, extraOptions, baseQuery) {
        const { payload, errors, isValid } = normalizeGuestClientPayload(arg);

        if (!isValid) {
          return {
            error: {
              status: "CLIENT_VALIDATION_ERROR",
              data: {
                detail: "Guest client data validation failed",
                errors,
              },
            },
          };
        }

        const result = await baseQuery(
          {
            url: "/auth/guest/",
            method: "POST",
            body: payload,
          },
          api,
          extraOptions
        );

        // Normalize response to a stable shape for the app + persist tokens immediately
        // (do not rely on onQueryStarted timing)
        if (!result?.data) return result;

        const { access, refresh, guest_id } = normalizeGuestCreateResponse(result.data);

        if (!access || !refresh) {
          return {
            error: {
              status: "RESPONSE_FORMAT_ERROR",
              data: {
                detail: "Guest create response does not contain tokens",
              },
            },
          };
        }

        const guestData = {
          accessToken: access,
          refreshToken: refresh,
          isGuest: true,
          guestId: guest_id,
        };

        // localStorage (apiSlice uses authStorage)
        setAuth({
          ...guestData,
          user: null,
        });

        // cookie (compatibility with middleware/initialState)
        Cookies.set("userInfo", JSON.stringify(guestData), { expires: 365 });

        // redux state
        api.dispatch(
          userLoggedIn({
            accessToken: access,
            user: null,
            isGuest: true,
            guestId: guest_id,
          })
        );

        return {
          data: {
            access,
            refresh,
            guest_id,
            raw: result.data,
          },
        };
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
  useRegisterMutation,
  useRegisterMutation: useRegisterUserMutation,
  useCreateGuestMutation,
  useGetUserQuery,
  useRefreshTokenMutation,
  useVerifyTokenMutation,
  useLogoutMutation,
  useUpdateProfileMutation,
} = authApi;
