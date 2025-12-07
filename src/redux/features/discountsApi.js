import { apiSlice } from "../api/apiSlice";

export const discountsApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    // Получение всех скидок с поддержкой пагинации
    getDiscounts: builder.query({
      query: ({ limit, offset } = {}) => {
        const params = new URLSearchParams();
        if (limit) params.append('limit', limit);
        if (offset) params.append('offset', offset);
        const queryString = params.toString() ? `?${params.toString()}` : '';
        console.log('Fetching discounts from:', `/discounts/${queryString}`);
        return `/discounts/${queryString}`;
      },
      providesTags: ['Discounts'],
      // Добавляем обработку ошибок и таймаут
      keepUnusedDataFor: 60, // Кэшируем на 60 секунд
      transformErrorResponse: (response, meta, arg) => {
        console.error('Discounts API Error Response:', response);
        return response;
      },
    }),

    // Получение скидки по ID
    getDiscountById: builder.query({
      query: (id) => `/discounts/${id}/`,
      providesTags: (result, error, id) => [{ type: 'Discounts', id }],
    }),

    // Создание скидки
    createDiscount: builder.mutation({
      query: (discountData) => ({
        url: '/discounts/',
        method: 'POST',
        body: discountData,
      }),
      invalidatesTags: ['Discounts'],
    }),

    // Обновление скидки
    updateDiscount: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/discounts/${id}/`,
        method: 'PATCH',
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Discounts', id }],
    }),

    // Удаление скидки
    deleteDiscount: builder.mutation({
      query: (id) => ({
        url: `/discounts/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Discounts'],
    }),

    // Применение скидки к товару/заказу
    applyDiscount: builder.mutation({
      query: ({ discountId, targetId, targetType }) => ({
        url: `/discounts/${discountId}/apply/`,
        method: 'POST',
        body: { target_id: targetId, target_type: targetType },
      }),
      invalidatesTags: ['Discounts', 'Orders', 'Carts'],
    }),
  }),
});

export const {
  useGetDiscountsQuery,
  useGetDiscountByIdQuery,
  useCreateDiscountMutation,
  useUpdateDiscountMutation,
  useDeleteDiscountMutation,
  useApplyDiscountMutation,
} = discountsApi;
