import { apiSlice } from "@/redux/api/apiSlice";
import { userLoggedIn, userLoggedOut } from "./authSlice";
import { setAuth, updateAuth, removeAuth, getAuth } from "@/utils/authStorage";
import { decodeJWT, getUserIdFromToken } from "@/utils/jwtDecode";
import Cookies from "js-cookie";
import { toast, notifySuccess, notifyError } from "@/utils/toast";
import { buildTelegramInitPayload } from "@/utils/telegram";

function mergeAuthUsers(existingUser, incomingUser) {
  if (!existingUser && !incomingUser) return null;

  const existing = existingUser || {};
  const incoming = incomingUser || {};

  const merged = {
    ...existing,
    ...incoming,
  };

  // Canonical frontend profile fields used across account/profile/checkout
  merged.name = incoming.name ?? incoming.first_name ?? existing.name ?? existing.first_name ?? "";
  merged.last_name = incoming.last_name ?? existing.last_name ?? "";
  merged.email = incoming.email ?? existing.email ?? "";
  merged.phone = incoming.phone ?? existing.phone ?? "";
  merged.nova_post_address = incoming.nova_post_address ?? incoming.address ?? existing.nova_post_address ?? existing.address ?? "";
  merged.login = incoming.login ?? incoming.username ?? existing.login ?? existing.username ?? "";

  return merged;
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
            login: arg.email,
          } : null;
          
          setAuth({
            accessToken: access,
            refreshToken: refresh,
            user: minimalUser,
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
                user: minimalUser,
              }),
              { expires: 7 }
            );
            console.log('Cookies userInfo set (tokens + minimal user)');
          } catch (cookieErr) {
            console.error('Failed to set cookies userInfo after login:', cookieErr);
          }
          
          // Вход внутри мини-аппа: этот Telegram привязывается к аккаунту сразу,
          // до подтверждения почты (ADR-0021). Конфликт 409 покажет сама привязка.
          const telegramPayload = buildTelegramInitPayload();
          if (telegramPayload) {
            try {
              await dispatch(authApi.endpoints.telegramAutoLink.initiate(telegramPayload)).unwrap();
            } catch {
              // сообщение уже показано в onQueryStarted привязки
            }
          }

          // Загружаем полный профиль и даем onQueryStarted(getUser) слить данные в auth state/storage
          try {
            console.log('Fetching user data...');
            const userResult = await dispatch(
              authApi.endpoints.getUser.initiate(undefined, { forceRefetch: true })
            ).unwrap();
            console.log('User data loaded successfully:', userResult);
          } catch (userError) {
            console.error('Failed to load user data after login:', userError);
          }
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

          if (!result?.data || typeof result.data !== 'object') {
            console.warn('⚠️ GET USER returned empty or non-object payload, skipping auth user merge');
            return;
          }
          
          // Получаем текущие данные из localStorage для сохранения токена
          const existing = getAuth();
          console.log('Current auth data in localStorage:', existing);

          const mergedUser = mergeAuthUsers(existing?.user || null, result.data);
          
          // Обновляем данные пользователя в store с сохранением токена
          dispatch(
            userLoggedIn({
              accessToken: existing?.accessToken || null, // Сохраняем токен
              user: mergedUser,
            })
          );
          console.log('Redux state updated with user data and token');
          
          // Обновляем localStorage с полной информацией о пользователе
          if (existing) {
            try {
              const updatedData = {
                user: mergedUser,
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
                user: mergedUser,
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

    // Смена пароля пользователя
    changePassword: builder.mutation({
      query: ({ current_password, new_password }) => ({
        url: "/auth/change-password/",
        method: "POST",
        body: {
          current_password,
          new_password,
        },
      }),
    }),
    
    // Запрос ссылки на восстановление пароля.
    // Бэкенд всегда отвечает 200, даже если аккаунта нет, — чтобы форму нельзя
    // было использовать для проверки, какие email зарегистрированы.
    requestPasswordReset: builder.mutation({
      query: ({ email, locale }) => ({
        url: "/auth/password-reset/",
        method: "POST",
        body: { email, locale },
      }),
    }),

    // Установка нового пароля по uid/token из письма
    confirmPasswordReset: builder.mutation({
      query: ({ uid, token, new_password }) => ({
        url: "/auth/password-reset/confirm/",
        method: "POST",
        body: { uid, token, new_password },
      }),
    }),

    // Подтверждение почты по токену из письма
    confirmEmail: builder.mutation({
      query: ({ token }) => ({
        url: "/auth/email/confirm/",
        method: "POST",
        body: { token },
      }),
    }),

    // Повторная отправка письма с подтверждением.
    // Бэкенд всегда отвечает 200 — и для неизвестного адреса, и для уже
    // подтверждённого, чтобы форму нельзя было использовать для проверки,
    // какие email зарегистрированы.
    resendEmailConfirmation: builder.mutation({
      query: ({ email, locale }) => ({
        url: "/auth/email/resend/",
        method: "POST",
        body: { email, locale },
      }),
    }),

    // Забор аккаунта, приехавшего из старой системы бота.
    // Код приходит клиенту персональной ссылкой в Telegram — у таких аккаунтов
    // нет почты, и обычный вход с восстановлением пароля им недоступен.
    getAccountClaim: builder.query({
      query: (code) => `/auth/claim/${code}/`,
    }),

    claimAccount: builder.mutation({
      query: ({ code, email, password, locale }) => ({
        url: "/auth/claim/",
        method: "POST",
        body: { code, email, password, locale },
      }),
    }),

    // Регистрация пользователя. Телефон обязателен (ADR-0021); занятый телефон —
    // просто ошибка поля, без подсказок.
    register: builder.mutation({
      query: (data) => ({
        url: "/auth/register/",
        method: "POST",
        body: data,
      }),

      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (err) {
          const status = err?.error?.status ?? err?.status;
          const data = err?.error?.data ?? err?.data;
          console.error('Registration error (details):', { status, data });
        }
      },
    }),

    telegramLink: builder.query({
      query: () => ({
        url: "/telegram/link",
        method: "GET",
      }),
      providesTags: ['User'],
      transformResponse: (response = {}) => ({
        ...response,
        link: response?.link || response?.url || null,
      }),
    }),

    telegramAutoLink: builder.mutation({
      query: (body = {}) => {
        const payload = buildTelegramInitPayload(body) || body;
        return {
          url: "/telegram/auto-link",
          method: "POST",
          body: payload,
        };
      },
      invalidatesTags: ['User'],
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          const { data } = await queryFulfilled;
          // Повторная привязка того же Telegram идемпотентна — молчим; тост
          // только когда привязок стало больше.
          const before = (getAuth()?.user?.telegram_ids || []).length;
          const after = (data?.telegram_ids || []).length;
          if (after > before) notifySuccess(data?.detail || 'Telegram linked');
          dispatch(authApi.endpoints.getUser.initiate(undefined, { forceRefetch: true }));
        } catch (error) {
          // 409 telegram_taken: слияний нет (ADR-0021) — показываем, за какой
          // почтой числится этот Telegram, решает человек.
          const data = error?.error?.data ?? error?.data;
          const message = data?.detail || data?.message || 'Telegram auto-link failed';
          notifyError(message);
          console.warn('Telegram auto link failed', error);
        }
      },
    }),

    telegramAuth: builder.mutation({
      query: (body) => ({
        url: "/telegram/auth",
        method: "POST",
        body,
      }),
      invalidatesTags: ['User'],
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          const result = await queryFulfilled;
          const { access, refresh, user, detail, message } = result.data || {};
          console.log('📲 TELEGRAM AUTH: response received', {
            hasAccess: !!access,
            hasRefresh: !!refresh,
            hasUser: !!user,
          });
          if (access) {
            setAuth({
              accessToken: access,
              refreshToken: refresh ?? null,
              user: user || null,
            });
            try {
              Cookies.set(
                'userInfo',
                JSON.stringify({
                  accessToken: access,
                  refreshToken: refresh ?? null,
                  user: user || null,
                }),
                { expires: 7 }
              );
              console.log('📲 TELEGRAM AUTH: cookie userInfo synced');
            } catch (cookieErr) {
              console.error('📲 TELEGRAM AUTH: failed to sync cookie userInfo', cookieErr);
            }
            dispatch(
              userLoggedIn({
                accessToken: access,
                user: user || null,
              })
            );
            console.log('📲 TELEGRAM AUTH: redux state updated, fetching /auth/me');
            dispatch(
              authApi.endpoints.getUser.initiate(undefined, { forceRefetch: true })
            );
            notifySuccess(detail || message || 'Telegram authorization successful');
          }
        } catch (error) {
          // 404 telegram_unknown или протухший initData: остаёмся анонимом,
          // каталог и корзина открыты, тост не нужен (ADR-0021).
          console.info('Telegram auth: no account for this Telegram', error?.error?.status ?? error?.status);
        }
      },
    }),

    // Обновление профиля пользователя (Swagger: PUT /clients/{id}/)
    updateProfile: builder.mutation({
      query: ({ id, data }) => ({
        url: `/clients/${id}/`,
        method: "PUT",
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
  useChangePasswordMutation,
  useRequestPasswordResetMutation,
  useConfirmPasswordResetMutation,
  useConfirmEmailMutation,
  useGetAccountClaimQuery,
  useClaimAccountMutation,
  useResendEmailConfirmationMutation,
  useRegisterMutation,
  useRegisterMutation: useRegisterUserMutation,
  useGetUserQuery,
  useTelegramLinkQuery,
  useLazyTelegramLinkQuery,
  useTelegramAutoLinkMutation,
  useTelegramAuthMutation,
  useRefreshTokenMutation,
  useVerifyTokenMutation,
  useLogoutMutation,
  useUpdateProfileMutation,
} = authApi;
