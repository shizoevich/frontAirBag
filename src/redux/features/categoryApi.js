import { apiSlice } from "../api/apiSlice";

export const categoryApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    // Get single category by slug
    getCategoryBySlug: builder.query({
      query: (slug) => `/good-categories/?slug=${slug}`,
      transformResponse: (response) => {
        // API returns a list, so we take the first item
        const category = response.results?.[0] || response.data?.[0] || response?.[0];
        return category;
      },
      providesTags: (result, error, slug) => [{ type: 'Category', slug }],
    }),
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
        
        // Функция для получения изображения по названию категории
        const getImageByTitle = (title, id_remonline) => {
          const imageMap = {
            // Автомобильные марки
            'Acura': 'acura.jpg',
            'Audi': 'audi.jpg',
            'BMW': 'bmw.jpg',
            'Buick': 'buick.jpg',
            'Cadillac': 'cadillac.jpg',
            'Chevrolet': 'chevrolet.jpg',
            'Dodge': 'dodge.jpg',
            'Fiat': 'fiat.jpg',
            'Ford': 'ford.jpg',
            'GMC': 'gmc.jpg',
            'Honda': 'honda.jpg',
            'Hyundai': 'hundai.jpg',
            'Infiniti': 'infinity.jpg',
            'Jaguar': 'jaguar.jpg',
            'Jeep': 'jeep.jpg',
            'KIA': 'kia.jpg',
            'Lexus': 'lexus.jpg',
            'Land Rover': 'land_rover.jpg',
            'Lincoln': 'lincoln.jpg',
            'Mini Cooper': 'mini_cooper.jpg',
            'Mazda': 'mazda.jpg',
            'Merсedes': 'mercedes.jpg',
            'Mitsubishi': 'mitsubishi.jpg',
            'Mustang': 'mustang.jpg',
            'Nissan': 'nissan.jpg',
            'Porsche': 'porsche.jpg',
            'Subaru': 'subaru.jpg',
            'Toyota': 'toyota.jpg',
            'Tesla': 'tesla.jpg',
            'VW': 'vw.jpg',
            'Volvo': 'volvo.jpg',
            
            // Пиропатроны
            'ПП в Ноги/Сиденье': 'pp-nogi-sedenie.jpg',
            'ПП в Ремни': 'pp-v-remni.jpg',
            'ПП в Шторы': 'pp-v-shtory.jpg',
            '1 запал': id_remonline === 753926 ? 'pp-v-rul-1-zapal.jpg' : 'pp-torpedo-1-zapal.jpg',
            '2 запала': id_remonline === 753925 ? 'pp-v-rul-2-zapal.jpg' : 'pp-torpedo-2-zapal.jpg',
            
            // Комплектующие
            'Коннекторы': 'connektory.jpg',
            'Крепления': 'kreplenia.jpg',
            'Обманки ( Резисторы )': 'obmanki-rezistory.jpg',
            'Парашюты ( Мешки )': 'parashuty-meshki.jpg',
            'Запчасти для Ремней': 'capchasti-dlya-remnei.jpg'
          };
          
          return imageMap[title] || 'noimage.png';
        };
        
        // Обрабатываем данные из API
        if (response && response.results) {
          const transformedData = response.results.map(item => ({
            id: item.id_remonline,
            title: item.title,
            parent_id: item.parent_id,
            image: getImageByTitle(item.title, item.id_remonline)
          }));
          
          console.log('Transformed categories data:', transformedData);
          
          return {
            data: transformedData,
            count: response.count,
            success: true
          };
        }
        
        // Fallback если API не отвечает
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