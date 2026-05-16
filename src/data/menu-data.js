import home_1 from '@assets/img/menu/menu-home-1.jpg';

const menu_data = [
  {
    id: 1,
    titleKey: 'menu.home',
    link: '/'
  },
  {
    id: 2,
    products: true,
    titleKey: 'menu.catalog',
    link: '/shop',
    product_pages: [
      {
        titleKey: 'menu.covers',
        link: '/shop/covers-754099',
        mega_menus: [
          { titleKey: 'menu.allBrands', link: '/search/brand', hasDropdown: true },
        ]
      },
      {
        titleKey: 'menu.airbagComponents',
        link: '/category/airbag-components',
        mega_menus: [
          { titleKey: 'menu.connectors', link: '/shop/konnektory-753917' },
          { titleKey: 'menu.mounts', link: '/shop/krepleniia-753918' },
          { titleKey: 'menu.resistors', link: '/shop/obmanki-rezistory-753919' },
          { titleKey: 'menu.airbags', link: '/shop/parashiuty-meshki-753897' },
          { titleKey: 'menu.beltParts', link: '/shop/zapchasti-dlia-remnei-753899' },
        ]
      },
      {
        titleKey: 'menu.pyrotechnics',
        link: '/category/pyrotechnics',
        mega_menus: [
          { titleKey: 'menu.pyroBelts', link: '/shop/pp-v-remni-753920' },
          { titleKey: 'menu.pyroSeats', link: '/shop/pp-v-nogi-sidenie-753898' },
          { titleKey: 'menu.pyroCurtains', link: '/shop/pp-v-shtory-753924' },
          { titleKey: 'menu.pyroSteering', link: '/shop/pp-v-rul-753925' },
          { titleKey: 'menu.pyroDashboard', link: '/shop/pp-torpedo-753927' },
        ]
      },

    ]
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
    link: '/profile',
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