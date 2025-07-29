import { apiSlice } from "../api/apiSlice";

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
  useDeleteClientMutation,
  useGetClientUpdatesQuery,
  useCreateClientUpdateMutation,
  useUpdateClientUpdateMutation,
  useDeleteClientUpdateMutation,
} = clientsApi;
