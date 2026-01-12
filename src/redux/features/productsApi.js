import { apiSlice } from "../api/apiSlice";

export const productsApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    // Получение всех товаров с фильтрацией и пагинацией
    getAllProducts: builder.query({
      query: ({ limit = 12, offset = 0, categoryId = null, searchText = '' } = {}) => {
        let url = `/goods/?limit=${limit}&offset=${offset}`;
        
        if (categoryId) {
          url += `&category_id=${categoryId}`;
        }
        
        if (searchText) {
          url += `&title__icontains=${encodeURIComponent(searchText)}`;
        }
        
        console.log('Запрос всех товаров:', url);
        return url;
      },
      transformResponse: (response) => {
        console.log('Ответ API всех товаров:', response);
        return response;
      },
      providesTags: ['AllProducts'],
    }),

    // Получение товара по ID
    getProductsByIds: builder.query({
      query: (id) => `/goods/${id}/`,
      transformResponse: (response) => {
        console.log('Ответ API товара по ID:', response);
        return response;
      },
      providesTags: (result, error, id) => [{ type: 'Product', id }],
    }),

    // Получение товаров по категории с пагинацией
    getProductsByCategory: builder.query({
      query: ({ categoryId, limit = 12, offset = 0 }) => {
        console.log(`Запрос товаров по категории id=${categoryId}, limit=${limit}, offset=${offset}`);
        return `/goods/?category_id=${categoryId}&limit=${limit}&offset=${offset}`;
      },
      transformResponse: (response) => {
        console.log('Ответ API товаров по категории:', response);
        return response;
      },
      providesTags: (result, error, params) => [{ type: 'products', id: params.categoryId }],
    }),

    // Получение рекомендуемых товаров по категории
    getFeaturedProducts: builder.query({
      query: (categoryId) => `/goods/?featured=true&category_id=${categoryId}`,
      providesTags: ['FeaturedProducts'],
    }),

    // Поиск товаров
    searchProducts: builder.query({
      query: ({ searchText, categoryId = null, limit = 12, offset = 0 }) => {
        let url = `/goods/?title__icontains=${encodeURIComponent(searchText)}&limit=${limit}&offset=${offset}`;
        
        if (categoryId) {
          url += `&category_id=${categoryId}`;
        }
        
        console.log('Поиск товаров:', url);
        return url;
      },
      transformResponse: (response) => {
        console.log('Результаты поиска:', response);
        return response;
      },
      providesTags: ['SearchResults'],
    }),

    // Добавление товара
    addProduct: builder.mutation({
      query: (productData) => ({
        url: '/goods/',
        method: 'POST',
        body: productData,
      }),
      invalidatesTags: ['AllProducts', 'products'],
    }),

    // Обновление товара
    updateProduct: builder.mutation({
      query: ({ id, ...productData }) => ({
        url: `/goods/${id}/`,
        method: 'PUT',
        body: productData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Product', id },
        'AllProducts',
        'products',
      ],
    }),

    // Удаление товара
    deleteProduct: builder.mutation({
      query: (id) => ({
        url: `/goods/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['AllProducts', 'products'],
    }),
  }),
});

export const {
  useGetAllProductsQuery,
  useGetProductsByIdsQuery,
  useGetFeaturedProductsQuery,
  useGetProductsByCategoryQuery,
  useSearchProductsQuery,
  useAddProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productsApi;