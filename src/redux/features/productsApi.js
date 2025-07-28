import { apiSlice } from "../api/apiSlice";

export const productsApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    // Получение всех товаров
    getAllProducts: builder.query({
      query: () => '/goods/',
      providesTags: ['products']
    }),

    // Получение товара по ID
    getProductById: builder.query({
      query: (id) => `/goods/${id}/`,
      providesTags: (result, error, id) => [{ type: 'products', id }],
    }),

    // Создание товара
    createProduct: builder.mutation({
      query: (productData) => ({
        url: '//',
        method: 'POST',
        body: productData
      }),
      invalidatesTags: ['products']
    }),

    // Обновление товара
    updateProduct: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/goods/${id}/`,
        method: 'PATCH',
        body: patch
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'products', id }],
    }),

    // Удаление товара
    deleteProduct: builder.mutation({
      query: (id) => ({
        url: `/goods/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['products']
    }),

    // Получение товаров по категории (по id_remonline)
    getProductsByCategory: builder.query({
      query: (id_remonline) => `/goods/?category__id_remonline=${id_remonline}`,
      providesTags: (result, error, id_remonline) => [{ type: 'products', id: id_remonline }],
    }),
    
    // Получение рекомендуемых товаров по категории
    getFeaturedProducts: builder.query({
      query: (id_remonline) => `/goods/?featured=true&category__id_remonline=${id_remonline}`,
      providesTags: ['FeaturedProducts'],
    }),

    // Получение всех категорий товаров (с древовидной структурой)
getProductCategories: builder.query({
  query: () => '/good-categories/',
  transformResponse: (response) => {
    // Handle case where response is undefined
    if (!response) return [];
    
    // Handle case where response.data is undefined
    const categories = response.data || response || [];
    
    const rootCategories = categories.filter(cat => !cat.parent_id);
    const buildTree = (parentId) => {
      return categories
        .filter(cat => cat.parent_id === parentId)
        .map(cat => ({
          ...cat,
          children: buildTree(cat.id),
        }));
    };
    return rootCategories.map(root => ({
      ...root,
      children: buildTree(root.id),
    }));
  },
  providesTags: ['productCategories'],
}),

    // Получение новых товаров по категории
    getNewArrivals: builder.query({
      query: ({ id_remonline }) => `/goods/?is_new=true&category__id_remonline=${id_remonline}`,
      providesTags: ['NewArrivals'],
    }),
  }),
});

export const {
  useGetAllProductsQuery,
  useGetProductByIdQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useGetProductsByCategoryQuery,
  useGetProductCategoriesQuery,
  useGetFeaturedProductsQuery,
  useGetNewArrivalsQuery, 
} = productsApi;