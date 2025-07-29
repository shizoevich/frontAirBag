import { apiSlice } from "../api/apiSlice";

export const cartApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    // Получение всех корзин
    getCarts: builder.query({
      query: () => '/carts/',
      providesTags: ['Carts'],
    }),

    // Получение корзины по ID
    getCartById: builder.query({
      query: (id) => `/carts/${id}/`,
      providesTags: (result, error, id) => [{ type: 'Carts', id }],
    }),

    // Создание корзины
    createCart: builder.mutation({
      query: (cartData) => ({
        url: '/carts/',
        method: 'POST',
        body: cartData,
      }),
      invalidatesTags: ['Carts'],
    }),

    // Обновление корзины
    updateCart: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/carts/${id}/`,
        method: 'PATCH',
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Carts', id }],
    }),

    // Удаление корзины
    deleteCart: builder.mutation({
      query: (id) => ({
        url: `/carts/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Carts'],
    }),

    // Получение товаров в корзине
    getCartItems: builder.query({
      query: (cartId) => `/cart-items/?cart=${cartId}`,
      providesTags: ['CartItems'],
    }),

    // Добавление товара в корзину
    addCartItem: builder.mutation({
      query: (itemData) => ({
        url: '/cart-items/',
        method: 'POST',
        body: itemData,
      }),
      invalidatesTags: ['CartItems', 'Carts'],
    }),

    // Обновление товара в корзине
    updateCartItem: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/cart-items/${id}/`,
        method: 'PATCH',
        body: patch,
      }),
      invalidatesTags: ['CartItems', 'Carts'],
    }),

    // Удаление товара из корзины
    removeCartItem: builder.mutation({
      query: (id) => ({
        url: `/cart-items/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['CartItems', 'Carts'],
    }),
  }),
});

export const {
  useGetCartsQuery,
  useGetCartByIdQuery,
  useCreateCartMutation,
  useUpdateCartMutation,
  useDeleteCartMutation,
  useGetCartItemsQuery,
  useAddCartItemMutation,
  useUpdateCartItemMutation,
  useRemoveCartItemMutation,
} = cartApi;
