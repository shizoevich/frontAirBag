import { apiSlice } from "../api/apiSlice";

export const categoryApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    // Получение дерева категорий
    getCategoryTree: builder.query({
      query: () => '/good-categories/tree/',
      providesTags: ['CategoryTree'],
    }),

    // Get single category by slug
    getCategoryBySlug: builder.query({
      query: (slug) => `/good-categories/?slug=${slug}`,
      transformResponse: (response) => {
        const category = response.results?.[0] || response.data?.[0] || response?.[0];
        return category;
      },
      providesTags: (result, error, slug) => [{ type: 'Category', slug }],
    }),

    // Получение категории по ID
    getCategoryById: builder.query({
      query: (id) => `/good-categories/${id}/`,
      providesTags: (result, error, id) => [{ type: 'Category', id }],
    }),

    // Добавление категории
    addCategory: builder.mutation({
      query: (categoryData) => ({
        url: '/good-categories/',
        method: 'POST',
        body: categoryData,
      }),
      invalidatesTags: ['categories', 'CategoryTree'],
    }),

    // Получение всех категорий (плоский список).
    // Отдаём именно массив: раньше здесь возвращался объект { data, count, success },
    // а компоненты искали в ответе `results`/`result` — и молча рисовали пустоту.
    getShowCategory: builder.query({
      query: () => '/good-categories/',
      transformResponse: (response) => response?.results || response?.data || [],
      providesTags: ['categories'],
    }),

    // Получение товаров по категории (используем category_id для учета всех детей)
    getProductsByCategoryId: builder.query({
      query: (category_id) => `/goods/?category_id=${category_id}`,
      transformResponse: (response) => response.results || [],
      providesTags: (result, error, category_id) => [{ type: 'products', id: category_id }],
    }),
  }),
});

export const {
  useAddCategoryMutation,
  useGetShowCategoryQuery,
  useGetCategoryTreeQuery,
  useGetCategoryBySlugQuery,
  useGetCategoryByIdQuery,
  useGetProductsByCategoryIdQuery,
} = categoryApi;