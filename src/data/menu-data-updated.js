import home_1 from '@assets/img/menu/menu-home-1.jpg';

const menu_data = [
  {
    id: 1,
    title: 'Главная',
    titleKey: 'home',
    link: '/'
  },
  {
    id: 2,
    products: true,
    title: '🔧 Каталог',
    titleKey: 'catalog',
    link: '/shop',
    product_pages: [
      {
        title: '🚘 Марки автомобилей',
        titleKey: 'car_brands',
        link: '/search/brand',
        mega_menus: [
          { title: 'Выберите марку автомобиля', titleKey: 'select_car_brand', link: '/search/brand' },
          { title: 'Автоковеры по брендам', titleKey: 'car_covers_by_brand', link: '/shop/covers' },
          { title: 'Поиск запчастей по марке авто', titleKey: 'search_parts_by_brand', link: '/search/by-brand' },
        ]
      },
      {
        title: '🛡️ Комплектующие Airbag SRS',
        titleKey: 'airbag_components',
        link: '/shop-category/airbag-components',
        mega_menus: [
          { title: 'Коннекторы - Разъёмы и соединители для подушек безопасности', titleKey: 'connectors', link: '/shop/connectors' },
          { title: 'Крепления - Крепёжные элементы и скобы', titleKey: 'mounts', link: '/shop/mounts' },
          { title: 'Обманки (Резисторы) - Резисторы для диагностики SRS', titleKey: 'resistors', link: '/shop/resistors' },
          { title: 'Парашюты (Мешки) - Пневматические мешки (Airbag)', titleKey: 'airbags', link: '/shop/airbags' },
          { title: 'Запчасти для Ремней - Фурнитура и компоненты ремней безопасности', titleKey: 'belt_parts', link: '/shop/belt-parts' },
        ]
      },
      {
        title: '💥 Пиропатроны',
        titleKey: 'squibs',
        link: '/shop-category/pyrotechnics',
        mega_menus: [
          { title: 'ПП в Ремни - Пиропатроны в ремни безопасности', titleKey: 'pyro_belts', link: '/shop/pyro-belts' },
          { title: 'ПП в Ноги/Сиденье - Пиропатроны в сиденья и нижнюю часть салона', titleKey: 'pyro_seats', link: '/shop/pyro-seats' },
          { title: 'ПП в Шторы - Шторные пиропатроны (боковая защита)', titleKey: 'pyro_curtains', link: '/shop/pyro-curtains' },
          { title: 'ПП в руль 1 запал / 2 запала - Пиропатроны в рулевую подушку', titleKey: 'pyro_steering', link: '/shop/pyro-steering' },
          { title: 'ПП в торпедо 1 запал / 2 запала - Пиропатроны в пассажирскую подушку', titleKey: 'pyro_dashboard', link: '/shop/pyro-dashboard' },
        ]
      },
      {
        title: '📊 Мой аккаунт',
        titleKey: 'my_account',
        link: '/profile',
        mega_menus: [
          { title: 'Корзина', titleKey: 'cart', link: '/cart' },
          { title: 'Оформление заказа', titleKey: 'checkout', link: '/checkout' },
          { title: 'Мои заказы', titleKey: 'my_orders', link: '/order' },
        ]
      },
    ]
  },
  {
    id: 3,
    sub_menu: true,
    title: '🔍 Поиск',
    titleKey: 'search',
    link: '/search',
    sub_menus: [
      { title: 'Поиск по каталогу', titleKey: 'search_catalog', link: '/shop' },
      { title: 'Поиск по VIN', titleKey: 'search_vin', link: '/search/vin' },
      { title: 'Поиск по марке', titleKey: 'search_by_brand', link: '/search/brand' },
    ],
  },
  {
    id: 4,
    single_link: true,
    title: '📞 Контакты',
    titleKey: 'contacts',
    link: '/contact',
  },
  {
    id: 5,
    single_link: true,
    title: '💰 Скидки',
    titleKey: 'discounts',
    link: '/coupon',
  },
]

export default menu_data;

// mobile_menu
export const mobile_menu = [
  {
    id: 1,
    single_link: true,
    title: 'Главная',
    titleKey: 'home',
    link: '/'
  },
  {
    id: 2,
    sub_menu: true,
    title: '🔧 Каталог',
    titleKey: 'catalog',
    link: '/shop',
    sub_menus: [
      { title: '🚘 Марки автомобилей', titleKey: 'car_brands', link: '/search/brand' },
      { title: '🛡️ Комплектующие Airbag SRS', titleKey: 'airbag_components', link: '/shop-category/airbag-components' },
      { title: '💥 Пиропатроны', titleKey: 'squibs', link: '/shop-category/pyrotechnics' },
    ],
  },
  {
    id: 3,
    sub_menu: true,
    title: '🔍 Поиск',
    titleKey: 'search',
    link: '/search',
    sub_menus: [
      { title: 'Поиск по каталогу', titleKey: 'search_catalog', link: '/shop' },
      { title: 'Поиск по VIN', titleKey: 'search_vin', link: '/search/vin' },
      { title: 'Поиск по марке', titleKey: 'search_by_brand', link: '/search/brand' },
    ],
  },
  {
    id: 4,
    sub_menu: true,
    title: '📊 Мой аккаунт',
    titleKey: 'my_account',
    link: '/profile',
    sub_menus: [
      { title: 'Корзина', titleKey: 'cart', link: '/cart' },
      { title: 'Оформление заказа', titleKey: 'checkout', link: '/checkout' },
      { title: 'Мои заказы', titleKey: 'my_orders', link: '/order' },
    ],
  },
  {
    id: 5,
    single_link: true,
    title: '📞 Контакты',
    titleKey: 'contacts',
    link: '/contact',
  },
  {
    id: 6,
    single_link: true,
    title: '💰 Скидки',
    titleKey: 'discounts',
    link: '/coupon',
  },
]
