import { apiSlice } from "../api/apiSlice";

export const productsApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    // Получение всех товаров с пагинацией
    getAllProducts: builder.query({
      query: ({ limit = 12, offset = 0, categoryId, parentCategoryId, searchText } = {}) => {
        let url = `/goods/?limit=${limit}&offset=${offset}`;
        if (categoryId) {
          url += `&category__id_remonline=${categoryId}`;
        } else if (parentCategoryId) {
          url += `&category__parent_id=${parentCategoryId}`;
        }
        if (searchText) {
          url += `&title__icontains=${encodeURIComponent(searchText)}`;
        }
        return url;
      },
      providesTags: ['products']
    }),
    
    // Получение всех товаров без пагинации (для фильтров и т.д.)
    getAllProductsNoLimit: builder.query({
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
        url: '/goods/',
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

    // Получение товаров по категории (по id_remonline) с пагинацией
    getProductsByCategory: builder.query({
      query: (params) => {
        const { id_remonline, limit = 12, offset = 0 } = params;
        console.log(`Запрос товаров по категории id_remonline=${id_remonline}, limit=${limit}, offset=${offset}`);
        return `/goods/?category__id_remonline=${id_remonline}&limit=${limit}&offset=${offset}`;
      },
      transformResponse: (response) => {
        console.log('Ответ API товаров по категории:', response);
        return response;
      },
      providesTags: (result, error, params) => [{ type: 'products', id: params.id_remonline }],
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
  const categories = Array.isArray(response.data)
    ? response.data
    : Array.isArray(response)
    ? response
    : [];

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

    // Получение связанных товаров (заглушка до реализации на бэкенде)
    getRelatedProducts: builder.query({
      query: (id) => `/goods/?limit=4`, // Получаем просто первые 4 товара как заглушку
      transformResponse: (response) => {
        // Заглушка: возвращаем первые товары из общего списка
        const products = response.results || response.data || response || [];
        return {
          data: products.slice(0, 4) // Ограничиваем до 4 товаров
        };
      },
      providesTags: ['RelatedProducts'],
    }),
  }),
});

export const {
  useGetAllProductsQuery,
  useGetAllProductsNoLimitQuery,
  useGetProductByIdQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useGetProductsByCategoryQuery,
  useGetProductCategoriesQuery,
  useGetFeaturedProductsQuery,
  useGetNewArrivalsQuery,
  useGetRelatedProductsQuery,
} = productsApi;