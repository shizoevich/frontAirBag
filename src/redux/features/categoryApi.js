import { apiSlice } from "../api/apiSlice";

export const categoryApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    // Получение дерева категорий
    getCategoryTree: builder.query({
      query: () => '/good-categories/tree/',
      transformResponse: (response) => {
        console.log('🌳 API ответ дерева категорий:', response);
        return response;
      },
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

    // Получение всех категорий (плоский список)
    getShowCategory: builder.query({
      query: () => 'good-categories/',
      transformResponse: (response) => {
        console.log('📋 API ответ категорий (список):', response);
        
        if (response && response.results) {
          return {
            data: response.results,
            count: response.count,
            success: true
          };
        }
        
        return {
          data: [],
          count: 0,
          success: false
        };
      },
      onError: (error) => {
        console.error('Ошибка загрузки категорий:', error);
      },
      providesTags: ['categories'],
    }),

    // Получение товаров по категории (используем category_id для учета всех детей)
    getProductsByCategoryId: builder.query({
      query: (category_id) => `goods/?category_id=${category_id}`,
      transformResponse: (response) => response.results || [],
      providesTags: (result, error, category_id) => [{ type: 'products', id: category_id }],
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
  useGetCategoryTreeQuery,
  useGetCategoryBySlugQuery,
  useGetCategoryByIdQuery,
  useGetProductsByCategoryIdQuery,
  useGetAllProductsQuery,
} = categoryApi;