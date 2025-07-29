import { apiSlice } from "../api/apiSlice";

export const ordersApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    // Получение всех заказов
    getOrders: builder.query({
      query: () => '/orders/',
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
  useGetOrderByIdQuery,
  useCreateOrderMutation,
  useUpdateOrderMutation,
  useDeleteOrderMutation,
  useGetOrderItemsQuery,
  useAddOrderItemMutation,
  useUpdateOrderItemMutation,
  useRemoveOrderItemMutation,
  useGetOrderUpdatesQuery,
  useCreateOrderUpdateMutation,
} = ordersApi;
