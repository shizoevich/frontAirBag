import home_1 from '@assets/img/menu/menu-home-1.jpg';

const menu_data = [
  {
    id: 1,
    titleKey: 'menu.home',
    link: '/'
  },
  {
    id: 2,
    // Мега-меню каталога строится из дерева категорий (см. menus.jsx / mobile-menus.jsx),
    // поэтому захардкоженных пунктов здесь нет — ссылки на категории собирает categoryPath.
    products: true,
    titleKey: 'menu.catalog',
    link: '/',
  },
  {
    id: 4,
    single_link: true,
    titleKey: 'menu.contacts',
    link: '/contact',
  },
  {
    id: 5,
    single_link: true,
    titleKey: 'menu.discounts',
    link: '/discounts',
  },
  {
    id: 6,
    user_account: true,
    titleKey: 'menu.myAccount',
    link: '/cabinet',
    account_pages: [
      { titleKey: 'menu.cart', link: '/cart', showAlways: true },
      { titleKey: 'menu.checkout', link: '/checkout', showAlways: true },
      { titleKey: 'menu.myOrders', link: '/orders', showAlways: true },
      { titleKey: 'menu.myProfile', link: '/profile', showForAuth: true },
      { titleKey: 'menu.login', link: '/login', showForGuests: true },
      { titleKey: 'menu.register', link: '/register', showForGuests: true },
      { titleKey: 'menu.logout', link: '/logout', showForAuth: true },
    ]
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
      { title: '🛡️ Комплектующие Airbag SRS', link: '/category/airbag-components' },
      { title: '💥 Пиропатроны', link: '/category/pyrotechnics' },
    ],
  },
  {
    id: 4,
    sub_menu: true,
    title: 'Мой аккаунт',
    link: '/profile',
    sub_menus: [
      { title: 'Корзина', link: '/cart' },
      { title: 'Оформление заказа', link: '/checkout' },
      { title: 'Мои заказы', link: '/order' },
    ],
  },
  {
    id: 5,
    single_link: true,
    title: 'Контакты',
    link: '/contact',
  },
  {
    id: 6,
    single_link: true,
    title: 'Скидки',
    link: '/discounts',
  },
]