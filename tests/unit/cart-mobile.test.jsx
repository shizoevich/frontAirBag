import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Корзина на телефоне.
 *
 * Табличная вёрстка требует 840 px, и ниже 1200 px уезжала в горизонтальный
 * скролл: на экране 390 px было видно 325 px, а колонка количества оставалась
 * за краем. Клиенты не могли изменить количество и не понимали, почему.
 *
 * В модалке корзины количества не было вовсе — только надпись «x2», а править
 * его предлагалось на странице корзины, куда клиент и не доходил.
 */

const dispatch = vi.fn();
let cartState;

vi.mock('react-redux', () => ({
  useDispatch: () => dispatch,
  useSelector: (selector) => selector({ cart: cartState }),
}));

vi.mock('next/navigation', () => ({ useParams: () => ({ locale: 'ru' }) }));
vi.mock('next-intl', () => ({ useTranslations: () => (key) => key }));
vi.mock('next/link', () => ({
  default: ({ children, href, ...rest }) => <a href={href} {...rest}>{children}</a>,
}));
vi.mock('next/image', () => ({ default: ({ alt }) => <img alt={alt} /> }));
vi.mock('@/components/common/BlurImage', () => ({ default: ({ alt }) => <img alt={alt} /> }));
vi.mock('@/utils/toast', () => ({ notifyError: vi.fn(), notifySuccess: vi.fn() }));
// Барель @/svg держит JSX в .js-файлах, vite их как JSX не разбирает.
vi.mock('@/svg', () => ({
  Close: () => <i />,
  Minus: () => <i />,
  Plus: () => <i />,
}));
vi.mock('@/hooks/use-cart-info', () => ({ default: () => ({ total: 4800, quantity: 4 }) }));
vi.mock('@/components/common/render-cart-progress', () => ({ default: () => <div /> }));
vi.mock('@/components/cart-components/cart-checkout', () => ({ default: () => <div /> }));

const PRODUCTS = [
  { id: 1, title: 'Jeep Grand Cherokee', price_minor: 120000, orderQuantity: 2, residue: 12 },
  { id: 2, title: 'VW Atlas', price_minor: 150000, orderQuantity: 1, residue: 5 },
];

const CartItemCard = (await import('@/components/cart-components/cart-item-card')).default;
const CartArea = (await import('@/components/cart-components/cart-area')).default;
const CartMiniSidebar = (await import('@/components/common/cart-mini-sidebar')).default;

beforeEach(() => {
  dispatch.mockClear();
  cartState = { cart_products: PRODUCTS, cartMiniOpen: true };
});

describe('карточка товара на узком экране', () => {
  it('показывает счётчик количества', () => {
    const { container } = render(<CartItemCard product={PRODUCTS[0]} />);

    expect(container.querySelector('.tp-product-quantity')).not.toBeNull();
    expect(container.querySelector('.tp-cart-input')).toHaveValue('2');
  });

  it('плюс меняет количество в корзине', () => {
    const { container } = render(<CartItemCard product={PRODUCTS[0]} />);

    fireEvent.click(container.querySelector('.tp-cart-plus'));

    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ payload: { id: 1, quantity: 3 } })
    );
  });

  it('показывает цену за штуку и сумму строки', () => {
    const { container } = render(<CartItemCard product={PRODUCTS[0]} />);

    expect(container.querySelector('.tp-cart-card-unit').textContent).toBe('1200.00₴');
    expect(container.querySelector('.tp-cart-card-total').textContent).toBe('2400.00₴');
  });

  it('товар можно убрать', () => {
    const { container } = render(<CartItemCard product={PRODUCTS[0]} />);

    fireEvent.click(container.querySelector('.tp-cart-card-remove'));

    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ payload: { title: 'Jeep Grand Cherokee', id: 1 } })
    );
  });
});

describe('страница корзины', () => {
  it('карточки показываются там, где таблица не помещается', () => {
    const { container } = render(<CartArea />);

    const cards = container.querySelector('.tp-cart-cards');
    expect(cards).not.toBeNull();
    expect(cards.className).toContain('d-xl-none');
    expect(container.querySelectorAll('.tp-cart-card')).toHaveLength(PRODUCTS.length);
  });

  it('таблица остаётся только на широких экранах', () => {
    const { container } = render(<CartArea />);

    const table = container.querySelector('.tp-cart-list table');
    expect(table.className).toContain('d-none');
    expect(table.className).toContain('d-xl-table');
  });

  it('каждый товар доступен для изменения количества в обоих видах', () => {
    const { container } = render(<CartArea />);

    // по счётчику на карточку и по счётчику на строку таблицы
    expect(container.querySelectorAll('.tp-product-quantity')).toHaveLength(PRODUCTS.length * 2);
  });
});

describe('модалка корзины', () => {
  it('количеством можно управлять прямо в модалке', () => {
    const { container } = render(<CartMiniSidebar />);

    const counters = container.querySelectorAll('.cartmini__widget-item .tp-product-quantity');
    expect(counters).toHaveLength(PRODUCTS.length);
  });

  it('плюс в модалке меняет количество', () => {
    const { container } = render(<CartMiniSidebar />);

    fireEvent.click(container.querySelector('.cartmini__widget-item .tp-cart-plus'));

    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ payload: { id: 1, quantity: 3 } })
    );
  });

  it('ведёт сразу к оформлению, без промежуточной страницы корзины', () => {
    const { container } = render(<CartMiniSidebar />);

    const links = [...container.querySelectorAll('.cartmini__checkout-btn a')];
    expect(links).toHaveLength(1);
    expect(links[0].getAttribute('href')).toBe('/ru/checkout');
    expect(links.some((a) => a.getAttribute('href') === '/ru/cart')).toBe(false);
  });

  it('надпись «x2» рядом со счётчиком не дублируется', () => {
    const { container } = render(<CartMiniSidebar />);

    expect(container.querySelectorAll('.cartmini__quantity')).toHaveLength(0);
  });

  it('цена и счётчик стоят в одной строке', () => {
    // Друг под другом они делали блок выше картинки, и строка товара
    // разъезжалась: цена и счётчик оказывались ниже её нижнего края.
    const { container } = render(<CartMiniSidebar />);

    const row = container.querySelector('.cartmini__widget-item .cartmini__row');
    expect(row).not.toBeNull();
    expect(row.querySelector('.tp-product-quantity')).not.toBeNull();
    expect(row.querySelector('.cartmini__price')).not.toBeNull();
  });

  it('корзину можно очистить прямо из модалки', () => {
    const { container } = render(<CartMiniSidebar />);

    const clear = container.querySelector('.cartmini__clear-btn');
    expect(clear).not.toBeNull();

    fireEvent.click(clear);

    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: expect.stringContaining('clearCart') })
    );
  });

  it('в пустой корзине очищать нечего — кнопки нет', () => {
    cartState = { cart_products: [], cartMiniOpen: true };

    const { container } = render(<CartMiniSidebar />);

    expect(container.querySelector('.cartmini__clear-btn')).toBeNull();
  });
});
