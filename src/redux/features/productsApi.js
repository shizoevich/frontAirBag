import { apiSlice } from "../api/apiSlice";

export const productsApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    // Получение всех товаров с пагинацией
    getAllProducts: builder.query({
      query: ({ limit = 12, offset = 0, categoryId, parentCategoryId, searchText } = {}) => {
        let url = `/goods/?limit=${limit}&offset=${offset}`;
        if (categoryId) {
          // For parent categories like Covers (754099), search by category__parent_id
          // For subcategories, search by category__id_remonline
          const parentCategoryIds = [754099, 754100, 754101]; // Known parent category IDs
          const numericCategoryId = Number(categoryId);
          if (parentCategoryIds.includes(numericCategoryId)) {
            url += `&category__parent_id=${numericCategoryId}`;
          } else {
            url += `&category__id_remonline=${numericCategoryId}`;
          }
        } else if (parentCategoryId) {
          url += `&category__parent_id=${parentCategoryId}`;
        }
        if (searchText) {
          url += `&title__icontains=${encodeURIComponent(searchText)}`;
        }
        console.log('Products API URL:', url);
        return url;
      },
      providesTags: ['products']
    }),
    
    // Получение всех товаров с поддержкой пагинации
    getAllProductsNoLimit: builder.query({
      query: ({ page = 1, limit = 12 } = {}) => {
        const params = new URLSearchParams();
        if (page) params.append('page', page);
        if (limit) params.append('limit', limit);
        return `/goods/?${params.toString()}`;
      },
      providesTags: ['products']
    }),

    // Debug endpoint to test category filtering with different field names
    getProductsByCategory: builder.query({
      query: (categoryId) => {
        const url = `/goods/?category=${categoryId}`;
        console.log('Debug category API URL:', url);
        return url;
      },
      providesTags: ['products']
    }),

    // Get all products to debug category relationships
    getAllProductsDebug: builder.query({
      query: () => {
        const url = `/goods/?limit=12`;
        console.log('Debug: Getting all products to check categories');
        return url;
      },
      transformResponse: (response) => {
        const products = response.results || response.data || response || [];
        console.log('Debug: All products with categories:', products.map(p => ({
          id: p.id,
          title: p.title,
          category: p.category,
          category_id: p.category_id,
          category__id_remonline: p.category__id_remonline,
          good_category: p.good_category
        })));
        return response;
      },
      providesTags: ['products']
    }),

    // Получение товара по ID
    getProductById: builder.query({
      query: (id) => `/goods/${id}/`,
      providesTags: (result, error, id) => [{ type: 'products', id }],
    }),

    // Получение товара по slug
    getProductBySlug: builder.query({
      query: (slug) => `/goods/?slug=${slug}`,
      transformResponse: (response) => {
        // API returns a list, so we take the first item
        const product = response.results?.[0] || response.data?.[0] || response?.[0];
        return product;
      },
      providesTags: (result, error, slug) => [{ type: 'products', slug }],
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

    // Получение товаров по списку ID (для "товары, которые покупают вместе")
    getProductsByIds: builder.query({
      query: (ids) => {
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
          return `/goods/?limit=0`; // Возвращаем пустой результат
        }
        // Создаем запрос с фильтрацией по id_remonline (так как together_buy содержит id_remonline)
        const idsQuery = ids.map(id => `id_remonline=${id}`).join('&');
        console.log('getProductsByIds - API URL:', `/goods/?${idsQuery}`);
        return `/goods/?${idsQuery}`;
      },
      transformResponse: (response) => {
        const products = response.results || response.data || response || [];
        return {
          data: products
        };
      },
      providesTags: ['BoughtTogetherProducts'],
    }),
  }),
});

export const {
  useGetAllProductsQuery,
  useGetAllProductsNoLimitQuery,
  useGetAllProductsDebugQuery,
  useGetProductsByCategoryQuery,
  useGetProductsByIdsQuery,
  useGetProductByIdQuery,
  useGetRelatedProductsQuery,
  useGetNewArrivalsQuery,
} = productsApi;