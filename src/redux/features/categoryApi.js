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
      query: () => 'good-categories/',
      transformResponse: (response) => {
        console.log('API ответ категорий:', response);
        return response.data || response || [];
      },
      onError: (error) => {
        console.error('Ошибка загрузки категорий:', error);
      },
      providesTags: ['categories'],
    }),

    // Получение товаров по категории (через id_remonline)
   getProductsByCategoryIdRemonline: builder.query({
  query: (id_remonline) => `goods/?category__id_remonline=${id_remonline}`,
  transformResponse: (response) => response.results || [],
  providesTags: (result, error, id_remonline) => [{ type: 'products', id: id_remonline }],
}),

    // Получение всех товаров
    getAllProducts: builder.query({
      query: () => 'goods/',
      transformResponse: (response) => {
        console.log('API ответ товаров:', response);
        return response.results || [];
      },
      onError: (error) => {
        console.error('Ошибка загрузки товаров:', error);
      },
      providesTags: ['allProducts'],
    }),
  }),
});

export const {
  useAddCategoryMutation,
  useGetShowCategoryQuery,
  useGetProductsByCategoryIdRemonlineQuery,
  useGetAllProductsQuery,
} = categoryApi;
