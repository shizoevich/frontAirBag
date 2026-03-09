import { apiSlice } from "../api/apiSlice";
import Cookies from 'js-cookie';
import { userLoggedIn } from './auth/authSlice';
import { getAuth, updateAuth } from '@/utils/authStorage';

function syncAuthUserEverywhere(dispatch, user) {
  if (!user) return;

  // redux
  dispatch(userLoggedIn({ user }));

  // localStorage
  try {
    updateAuth({ user });
  } catch {
    // ignore
  }

  // cookie (compatibility with middleware/initialState)
  try {
    const existing = getAuth() || {};
    const cookieExisting = Cookies.get('userInfo');
    const cookieTokens = cookieExisting ? JSON.parse(cookieExisting) : {};
    Cookies.set(
      'userInfo',
      JSON.stringify({
        accessToken: cookieTokens.accessToken || existing?.accessToken || null,
        refreshToken: cookieTokens.refreshToken || existing?.refreshToken || null,
        user,
        isGuest: user?.is_guest || false,
        guestId: user?.guest_id || existing?.guestId || null,
      }),
      { expires: 7 }
    );
  } catch {
    // ignore
  }
}

export const clientsApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    // Получение всех клиентов
    getClients: builder.query({
      query: () => '/clients/',
      providesTags: ['Clients'],
    }),

    // Получение клиента по ID
    getClientById: builder.query({
      query: (id) => `/clients/${id}/`,
      providesTags: (result, error, id) => [{ type: 'Clients', id }],
    }),

    // Создание клиента
    createClient: builder.mutation({
      query: (clientData) => ({
        url: '/clients/',
        method: 'POST',
        body: clientData,
      }),
      invalidatesTags: ['Clients'],
    }),

    // Обновление клиента
    updateClient: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/clients/${id}/`,
        method: 'PATCH',
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Clients', id }],
    }),

    // Full update клиента (Swagger: PUT /clients/{id}/)
    updateClientPut: builder.mutation({
      query: ({ id, data }) => ({
        url: `/clients/${id}/`,
        method: 'PUT',
        body: data,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const res = await queryFulfilled;
          // Keep auth user in sync so checkout form is prefilled next time
          syncAuthUserEverywhere(dispatch, res?.data);
        } catch {
          // non-blocking
        }
      },
      invalidatesTags: (result, error, { id }) => [{ type: 'Clients', id }],
    }),

    // Удаление клиента
    deleteClient: builder.mutation({
      query: (id) => ({
        url: `/clients/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Clients'],
    }),

    // Получение обновлений клиента
    getClientUpdates: builder.query({
      query: (clientId) => `/client-updates/?client=${clientId}`,
      providesTags: ['ClientUpdates'],
    }),

    // Создание обновления клиента
    createClientUpdate: builder.mutation({
      query: (updateData) => ({
        url: '/client-updates/',
        method: 'POST',
        body: updateData,
      }),
      invalidatesTags: ['ClientUpdates'],
    }),

    // Обновление записи обновления клиента
    updateClientUpdate: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/client-updates/${id}/`,
        method: 'PATCH',
        body: patch,
      }),
      invalidatesTags: ['ClientUpdates'],
    }),

    // Удаление обновления клиента
    deleteClientUpdate: builder.mutation({
      query: (id) => ({
        url: `/client-updates/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ClientUpdates'],
    }),
  }),
});

export const {
  useGetClientsQuery,
  useGetClientByIdQuery,
  useCreateClientMutation,
  useUpdateClientMutation,
  useUpdateClientPutMutation,
  useDeleteClientMutation,
  useGetClientUpdatesQuery,
  useCreateClientUpdateMutation,
  useUpdateClientUpdateMutation,
  useDeleteClientUpdateMutation,
} = clientsApi;
