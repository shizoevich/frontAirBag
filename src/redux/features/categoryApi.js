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
        
        // Для тестирования используем предоставленный JSON
        const testData = {
          "data": [
            {"id": 753903, "title": "Acura", "parent_id": 754099, "image": "acura.jpg"},
            {"id": 753902, "title": "Audi", "parent_id": 754099, "image": "audi.jpg"},
            {"id": 753904, "title": "BMW", "parent_id": 754099, "image": "bmw.jpg"},
            {"id": 753906, "title": "Buick", "parent_id": 754099, "image": "buick.jpg"},
            {"id": 1121716, "title": "Cadillac", "parent_id": 754099, "image": "cadillac.jpg"},
            {"id": 753907, "title": "Chevrolet", "parent_id": 754099, "image": "chevrolet.jpg"},
            {"id": 753905, "title": "Dodge", "parent_id": 754099, "image": "dodge.jpg"},
            {"id": 1140060, "title": "Fiat", "parent_id": 754099, "image": "fiat.jpg"},
            {"id": 753908, "title": "Ford", "parent_id": 754099, "image": "ford.jpg"},
            {"id": 1121717, "title": "GMC", "parent_id": 754099, "image": "gmc.jpg"},
            {"id": 753909, "title": "Honda", "parent_id": 754099, "image": "honda.jpg"},
            {"id": 753900, "title": "Hyundai", "parent_id": 754099, "image": "hundai.jpg"},
            {"id": 753922, "title": "Infiniti", "parent_id": 754099, "image": "infinity.jpg"},
            {"id": 1140061, "title": "Jaguar", "parent_id": 754099, "image": "jaguar.jpg"},
            {"id": 753896, "title": "Jeep", "parent_id": 754099,"image": "jeep.jpg"},
            {"id": 1121713, "title": "KIA", "parent_id": 754099, "image": "kia.jpg"},
            {"id": 753901, "title": "Lexus", "parent_id": 754099, "image": "lexus.jpg"},
            {"id": 1077872, "title": "Land Rover", "parent_id": 754099, "image": "land_rover.jpg"},
            {"id": 753910, "title": "Lincoln", "parent_id": 754099, "image": "lincoln.jpg"},
            {"id": 1140062, "title": "Mini Cooper", "parent_id": 754099, "image": "mini_cooper.jpg"},
            {"id": 753912, "title": "Mazda", "parent_id": 754099, "image": "mazda.jpg"},
            {"id": 1121715, "title": "Merсedes", "parent_id": 754099, "image": "mercedes.jpg"},
            {"id": 753911, "title": "Mitsubishi", "parent_id": 754099, "image": "mitsubishi.jpg"},
            {"id": 1105320, "title": "Mustang", "parent_id": 754099, "image": "mustang.jpg"},
            {"id": 753913, "title": "Nissan", "parent_id": 754099, "image": "nissan.jpg"},
            {"id": 875421, "title": "Porsche", "parent_id": 754099, "image": "porsche.jpg"},
            {"id": 753914, "title": "Subaru", "parent_id": 754099, "image": "subaru.jpg"},
            {"id": 753915, "title": "Toyota", "parent_id": 754099, "image": "toyota.jpg"},
            {"id": 753921, "title": "Tesla", "parent_id": 754099, "image": "tesla.jpg"},
            {"id": 753916, "title": "VW", "parent_id": 754099, "image": "vw.jpg"},
            {"id": 1140059, "title": "Volvo", "parent_id": 754099, "image": "volvo.jpg"},

            {"id": 753898, "title": "ПП в Ноги/Сиденье", "parent_id": 754101,"image": "pp-nogi-sedenie.jpg"},
            {"id": 753917, "title": "Коннекторы", "parent_id": 754100,"image": "connektory.jpg"},
            {"id": 753918, "title": "Крепления", "parent_id": 754100,"image": "kreplenia.jpg"},
            {"id": 753919, "title": "Обманки ( Резисторы )", "parent_id": 754100,"image": "obmanki-rezistory.jpg"},
            {"id": 753897, "title": "Парашюты ( Мешки )", "parent_id": 754100,"image": "parashuty-meshki.jpg"},
            {"id": 753899, "title": "Запчасти для Ремней", "parent_id": 754100,"image": "capchasti-dlya-remnei.jpg"},
            {"id": 753920, "title": "ПП в Ремни", "parent_id": 754101,"image": "pp-v-remni.jpg"},
            {"id": 753924, "title": "ПП в Шторы", "parent_id": 754101,"image": "pp-v-shtory.jpg"},
            {"id": 753926, "title": "ПП в руль 1 запал", "parent_id": 754101,"image": "pp-v-rul-1-zapal.jpg"},
            {"id": 753925, "title": "ПП в руль 2 запала", "parent_id": 754101,"image": "pp-v-rul-2-zapal.jpg"},
            {"id": 753928, "title": "ПП в торпедо 1 запал", "parent_id": 754101,"image": "pp-torpedo-1-zapal.jpg"},
            {"id": 753927, "title": "ПП в торпедо 2 запала", "parent_id": 754101,"image": "pp-torpedo-2-zapal.jpg"},
            {"id": 754099, "title": "Covers","image": "noimage.png"},
            {"id": 754100, "title": "Комплектующие Airbag SRS","image": "noimage.png"},
            {"id": 754101, "title": "Пиропатроны","image": "noimage.png"}
          ],
          "count": 37, 
          "success": true
        };
        
        // Используем тестовые данные вместо ответа API
        return testData;
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
