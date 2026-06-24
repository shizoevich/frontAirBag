import { apiSlice } from "../api/apiSlice";

export const ordersApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    // Получение заказов (с фильтром по клиенту чтобы админ видел только свои)
    getOrders: builder.query({
      query: (clientId) => clientId ? `/orders/?client=${clientId}` : '/orders/',
      providesTags: ['Orders'],
    }),

    // AIRBAG-88: серверная фильтрация/сортировка/пагинация + infinite scroll.
    // Отдельный endpoint, чтобы не влиять на getOrders (discounts/checkout).
    getOrdersList: builder.query({
      query: ({ client, ordering = '-date', limit = 20, offset = 0, dateFrom, dateTo, status } = {}) => {
        const p = new URLSearchParams();
        if (client) p.set('client', String(client));
        p.set('ordering', ordering);
        p.set('limit', String(limit));
        p.set('offset', String(offset));
        if (dateFrom) p.set('date__gte', dateFrom);
        if (dateTo) p.set('date__lte', `${dateTo}T23:59:59`);
        if (status === 'completed') {
          p.set('is_completed', 'true');
        } else if (status === 'paid') {
          p.set('is_completed', 'false');
          p.set('is_paid', 'true');
        } else if (status === 'pending') {
          p.set('is_completed', 'false');
          p.set('is_paid', 'false');
        }
        return `/orders/?${p.toString()}`;
      },
      // Один кэш-энтри на набор фильтров (без offset) — страницы склеиваются
      serializeQueryArgs: ({ queryArgs }) => {
        const { offset, ...rest } = queryArgs || {};
        return rest;
      },
      merge: (currentCache, newItems, { arg }) => {
        if (!arg || (arg.offset ?? 0) === 0) {
          return newItems; // первая страница / смена фильтра — заменить
        }
        if (currentCache?.results && newItems?.results) {
          currentCache.results.push(...newItems.results);
          currentCache.next = newItems.next;
          currentCache.count = newItems.count;
          currentCache.total_amount_minor = newItems.total_amount_minor;
        }
      },
      forceRefetch: ({ currentArg, previousArg }) =>
        (currentArg?.offset ?? 0) !== (previousArg?.offset ?? 0),
      providesTags: ['Orders'],
    }),

    // Получение заказа по ID
    getOrderById: builder.query({
      query: (id) => `/orders/${id}/`,
      providesTags: (result, error, id) => [{ type: 'Orders', id }],
    }),

    // Создание заказа
    createOrder: builder.mutation({
      query: (orderData) => ({
        url: '/orders/',
        method: 'POST',
        body: orderData,
      }),
      invalidatesTags: ['Orders'],
    }),

    // Обновление заказа
    updateOrder: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/orders/${id}/`,
        method: 'PATCH',
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Orders', id }],
    }),

    // Удаление заказа
    deleteOrder: builder.mutation({
      query: (id) => ({
        url: `/orders/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Orders'],
    }),

    // Банковские реквизиты для оплаты по реквизитам
    getBankDetails: builder.query({
      query: () => '/bank-details/',
    }),

    // Загрузка документа об оплате (для оплаты по реквизитам)
    uploadPaymentDoc: builder.mutation({
      query: ({ orderId, file }) => {
        const formData = new FormData();
        formData.append('document', file);
        return {
          url: `/orders/${orderId}/upload-payment-doc/`,
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: (result, error, { orderId }) => [{ type: 'Orders', id: orderId }],
    }),

    // Получение товаров заказа
    getOrderItems: builder.query({
      query: (orderId) => `/order-items/?order=${orderId}`,
      providesTags: ['OrderItems'],
    }),

    // Добавление товара в заказ
    addOrderItem: builder.mutation({
      query: (itemData) => ({
        url: '/order-items/',
        method: 'POST',
        body: itemData,
      }),
      invalidatesTags: ['OrderItems', 'Orders'],
    }),

    // Обновление товара в заказе
    updateOrderItem: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/order-items/${id}/`,
        method: 'PATCH',
        body: patch,
      }),
      invalidatesTags: ['OrderItems', 'Orders'],
    }),

    // Удаление товара из заказа
    removeOrderItem: builder.mutation({
      query: (id) => ({
        url: `/order-items/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['OrderItems', 'Orders'],
    }),

    // Получение обновлений заказа
    getOrderUpdates: builder.query({
      query: (orderId) => `/order-updates/?order=${orderId}`,
      providesTags: ['OrderUpdates'],
    }),

    // Создание обновления заказа
    createOrderUpdate: builder.mutation({
      query: (updateData) => ({
        url: '/order-updates/',
        method: 'POST',
        body: updateData,
      }),
      invalidatesTags: ['OrderUpdates'],
    }),
  }),
});

export const {
  useGetOrdersQuery,
  useGetOrdersListQuery,
  useGetOrderByIdQuery,
  useCreateOrderMutation,
  useUpdateOrderMutation,
  useDeleteOrderMutation,
  useGetBankDetailsQuery,
  useUploadPaymentDocMutation,
  useGetOrderItemsQuery,
  useAddOrderItemMutation,
  useUpdateOrderItemMutation,
  useRemoveOrderItemMutation,
  useGetOrderUpdatesQuery,
  useCreateOrderUpdateMutation,
} = ordersApi;
