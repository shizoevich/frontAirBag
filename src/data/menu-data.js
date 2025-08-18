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
        titleKey: 'menu.carBrands',
        link: '/search/brand',
        mega_menus: [
          { titleKey: 'menu.selectCarBrand', link: '/search/brand' },
          { titleKey: 'menu.carMats', link: '/shop/covers' },
          { titleKey: 'menu.searchByBrand', link: '/search/by-brand' },
        ]
      },
      {
        titleKey: 'menu.airbagComponents',
        link: '/shop-category/airbag-components',
        mega_menus: [
          { titleKey: 'menu.connectors', link: '/shop/connectors' },
          { titleKey: 'menu.mounts', link: '/shop/mounts' },
          { titleKey: 'menu.resistors', link: '/shop/resistors' },
          { titleKey: 'menu.airbags', link: '/shop/airbags' },
          { titleKey: 'menu.beltParts', link: '/shop/belt-parts' },
        ]
      },
      {
        titleKey: 'menu.pyrotechnics',
        link: '/shop-category/pyrotechnics',
        mega_menus: [
          { titleKey: 'menu.pyroBelts', link: '/shop/pyro-belts' },
          { titleKey: 'menu.pyroSeats', link: '/shop/pyro-seats' },
          { titleKey: 'menu.pyroCurtains', link: '/shop/pyro-curtains' },
          { titleKey: 'menu.pyroSteering', link: '/shop/pyro-steering' },
          { titleKey: 'menu.pyroDashboard', link: '/shop/pyro-dashboard' },
        ]
      },
      {
        titleKey: 'menu.myAccount',
        link: '/profile',
        mega_menus: [
          { titleKey: 'menu.cart', link: '/cart' },
          { titleKey: 'menu.checkout', link: '/checkout' },
          { titleKey: 'menu.myOrders', link: '/order' },
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
    id: 4,
    sub_menu: true,
    title: '📊 Мой аккаунт',
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