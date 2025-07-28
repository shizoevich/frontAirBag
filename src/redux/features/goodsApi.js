import { apiSlice } from "../api/apiSlice";

export const goodsApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    // Получение всех товаров
    getAllGoods: builder.query({
      query: () => '/goods/',
      providesTags: ['Goods']
    }),

    // Получение товара по ID
    getGoodById: builder.query({
      query: (id) => `/goods/${id}/`,
      providesTags: (result, error, id) => [{ type: 'Goods', id }],
    }),

    // Создание товара
    createGood: builder.mutation({
      query: (goodData) => ({
        url: '/goods/',
        method: 'POST',
        body: goodData
      }),
      invalidatesTags: ['Goods']
    }),

    // Обновление товара
    updateGood: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/goods/${id}/`,
        method: 'PATCH',
        body: patch
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Goods', id }],
    }),

    // Удаление товара
    deleteGood: builder.mutation({
      query: (id) => ({
        url: `/goods/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Goods']
    }),

    // Получение товаров по категории (по id_remonline)
    getGoodsByCategory: builder.query({
      query: (id_remonline) => `/goods/?category__id_remonline=${id_remonline}`,
      providesTags: (result, error, id_remonline) => [{ type: 'Goods', id: id_remonline }],
    }),
    
    // Получение рекомендуемых товаров по категории
    getFeaturedProducts: builder.query({
      query: (id_remonline) => `/goods/?featured=true&category__id_remonline=${id_remonline}`,
      providesTags: ['FeaturedProducts'],
    }),

    // Получение всех категорий товаров (с древовидной структурой)
    getGoodCategories: builder.query({
      query: () => '/good-categories/',
      transformResponse: (response) => {
        const categories = response.data;
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
      providesTags: ['GoodCategories'],
    }),

    // Получение новых товаров по категории
    getNewArrivals: builder.query({
      query: ({ id_remonline }) => `/goods/?is_new=true&category__id_remonline=${id_remonline}`,
      providesTags: ['NewArrivals'],
    }),
  }),
});

export const {
  useGetAllGoodsQuery,
  useGetGoodByIdQuery,
  useCreateGoodMutation,
  useUpdateGoodMutation,
  useDeleteGoodMutation,
  useGetGoodsByCategoryQuery,
  useGetGoodCategoriesQuery,
  useGetFeaturedProductsQuery,
  useGetNewArrivalsQuery, 
} = goodsApi;