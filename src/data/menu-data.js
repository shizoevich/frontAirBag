import home_1 from '@assets/img/menu/menu-home-1.jpg';

const menu_data = [
  {
    id: 1,
    title: 'Главная',
    link: '/'
  },
  {
    id: 2,
    products: true,
    title: '🔧 Каталог',
    link: '/shop',
    product_pages: [
      {
        title: '🚘 Марки автомобилей',
        link: '/search/brand',
        mega_menus: [
          { title: 'Выберите марку автомобиля', link: '/search/brand' },
          { title: 'Автоковеры по брендам', link: '/shop/covers' },
          { title: 'Поиск запчастей по марке авто', link: '/search/by-brand' },
        ]
      },
      {
        title: '🛡️ Комплектующие Airbag SRS',
        link: '/shop-category/airbag-components',
        mega_menus: [
          { title: 'Коннекторы - Разъёмы и соединители для подушек безопасности', link: '/shop/connectors' },
          { title: 'Крепления - Крепёжные элементы и скобы', link: '/shop/mounts' },
          { title: 'Обманки (Резисторы) - Резисторы для диагностики SRS', link: '/shop/resistors' },
          { title: 'Парашюты (Мешки) - Пневматические мешки (Airbag)', link: '/shop/airbags' },
          { title: 'Запчасти для Ремней - Фурнитура и компоненты ремней безопасности', link: '/shop/belt-parts' },
        ]
      },
      {
        title: '💥 Пиропатроны',
        link: '/shop-category/pyrotechnics',
        mega_menus: [
          { title: 'ПП в Ремни - Пиропатроны в ремни безопасности', link: '/shop/pyro-belts' },
          { title: 'ПП в Ноги/Сиденье - Пиропатроны в сиденья и нижнюю часть салона', link: '/shop/pyro-seats' },
          { title: 'ПП в Шторы - Шторные пиропатроны (боковая защита)', link: '/shop/pyro-curtains' },
          { title: 'ПП в руль 1 запал / 2 запала - Пиропатроны в рулевую подушку', link: '/shop/pyro-steering' },
          { title: 'ПП в торпедо 1 запал / 2 запала - Пиропатроны в пассажирскую подушку', link: '/shop/pyro-dashboard' },
        ]
      },
      {
        title: '📊 Мой аккаунт',
        link: '/profile',
        mega_menus: [
          { title: 'Корзина', link: '/cart' },
          { title: 'Избранное', link: '/wishlist' },
          { title: 'Оформление заказа', link: '/checkout' },
          { title: 'Мои заказы', link: '/order' },
        ]
      },
    ]
  },
  {
    id: 3,
    sub_menu: true,
    title: '🔍 Поиск',
    link: '/search',
    sub_menus: [
      { title: 'Поиск по каталогу', link: '/shop' },
      { title: 'Поиск по VIN', link: '/search/vin' },
      { title: 'Поиск по марке', link: '/search/brand' },
    ],
  },
  {
    id: 4,
    single_link: true,
    title: '📞 Контакты',
    link: '/contact',
  },
  {
    id: 5,
    single_link: true,
    title: '💰 Скидки',
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
    link: '/'
  },
  {
    id: 2,
    sub_menu: true,
    title: '🔧 Каталог',
    link: '/shop',
    sub_menus: [
      { title: '🚘 Марки автомобилей', link: '/search/brand' },
      { title: '🛡️ Комплектующие Airbag SRS', link: '/shop-category/airbag-components' },
      { title: '💥 Пиропатроны', link: '/shop-category/pyrotechnics' },
    ],
  },
  {
    id: 3,
    sub_menu: true,
    title: '🔍 Поиск',
    link: '/search',
    sub_menus: [
      { title: 'Поиск по каталогу', link: '/shop' },
      { title: 'Поиск по VIN', link: '/search/vin' },
      { title: 'Поиск по марке', link: '/search/brand' },
    ],
  },
  {
    id: 4,
    sub_menu: true,
    title: '📊 Мой аккаунт',
    link: '/profile',
    sub_menus: [
      { title: 'Корзина', link: '/cart' },
      { title: 'Избранное', link: '/wishlist' },
      { title: 'Оформление заказа', link: '/checkout' },
      { title: 'Мои заказы', link: '/order' },
    ],
  },
  {
    id: 5,
    single_link: true,
    title: '📞 Контакты',
    link: '/contact',
  },
  {
    id: 6,
    single_link: true,
    title: '💰 Скидки',
    link: '/coupon',
  },
]