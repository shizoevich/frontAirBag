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

        // Получение товара по ID (работает с id и id_remonline)
        getProductsByIds: builder.query({
          query: (id) => {
            // Если ID числовой и длинный (>1000000), вероятно это id_remonline
            // Иначе - обычный id
            const paramName = id > 1000000 ? 'id_remonline' : 'id';
            return `/goods/?${paramName}=${id}`;
          },
          transformResponse: (response) => {
            console.log('Ответ API товара по ID:', response);
            // Возвращаем первый найденный товар или пустой объект
            return response.results && response.results.length > 0 ? response.results[0] : null;
          },
          providesTags: (result, error, id) => result ? [{ type: 'Product', id: result.id }] : [],
        }),

       // Получение товаров по массиву ID (несколько товаров)
       getProductsByMultipleIds: builder.query({
        query: (ids) => {
          if (Array.isArray(ids) && ids.length > 0) {
            // Убираем дубликаты ID
            const uniqueIds = [...new Set(ids)];
            // Создаем строку запроса с несколькими id
            const idsParam = uniqueIds.join(',');
            return `/goods/?id=${idsParam}`;
          }
          return '/goods/';
        },
        transformResponse: (response) => {
          console.log('Ответ API товаров по нескольким ID:', response);
          // API возвращает { count, next, previous, results: [...] }
          // Преобразуем в формат { data: [...], count, next, previous }
          return {
            data: response.results || [],
            count: response.count || 0,
            next: response.next,
            previous: response.previous
          };
        },
        providesTags: (result, error, ids) => {
          if (Array.isArray(ids)) {
            return ids.map(id => ({ type: 'Product', id }));
          }
          return ['Products'];
        },
      }),

          // Получение всех товаров без лимита (для фильтров)
    getAllProductsNoLimit: builder.query({
      query: () => 'goods/',
      transformResponse: (response) => {
        return {
          data: response.results || [],
          count: response.count || 0,
        };
      },
      providesTags: ['AllProducts'],
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

       // Получение связанных товаров (товары из той же категории)
       // Получение связанных товаров (товары из той же категории)
    getRelatedProducts: builder.query({
      query: (productId) => `/goods/${productId}/related/`,
      transformResponse: (response) => {
        console.log('Связанные товары:', response);
        // API возвращает { count, next, previous, results: [...] }
        // Преобразуем в формат { data: [...], count, next, previous }
        return {
          data: response.results || [],
          count: response.count || 0,
          next: response.next,
          previous: response.previous
        };
      },
      providesTags: ['RelatedProducts'],
    }),

  }),
});

export const {
  useGetAllProductsQuery,
  useGetAllProductsNoLimitQuery,
  useGetProductsByIdsQuery,
  useGetProductsByMultipleIdsQuery,
  useGetFeaturedProductsQuery,
  useGetProductsByCategoryQuery,
  useSearchProductsQuery,
  useAddProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useGetRelatedProductsQuery
} = productsApi;