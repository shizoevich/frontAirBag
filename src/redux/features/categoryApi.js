import { apiSlice } from "../api/apiSlice";

export const categoryApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    // Добавление категории
    addCategory: builder.mutation({
      query: (categoryData) => ({
        url: '/api/category/add',
        method: 'POST',
        body: categoryData,
      }),
      invalidatesTags: ['categories'],
    }),

    // Получение всех категорий
    getShowCategory: builder.query({
      query: () => '/good-categories/',
      providesTags: ['categories'],
    }),

    // Получение товаров по категории (через id_remonline)
    getProductsByCategoryIdRemonline: builder.query({
      query: (id_remonline) => `/goods/?category__id_remonline=${id_remonline}`,
      providesTags: (result, error, id_remonline) => [{ type: 'products', id: id_remonline }],
    }),
  }),
});

export const {
  useAddCategoryMutation,
  useGetShowCategoryQuery,
  useGetProductsByCategoryIdRemonlineQuery,
} = categoryApi;
