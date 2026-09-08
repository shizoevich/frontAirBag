import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

/**
 * Фотографии в карточке товара.
 *
 * Подмена фото висела на `onMouseEnter`. На тач-экране браузер шлёт синтетический
 * `mouseenter` первым тапом и съедает его: у товара с двумя фото первый тап менял
 * картинку, и только второй открывал карточку. Половина каталога имеет второе фото,
 * так что половина карточек вела себя не так, как остальные.
 *
 * Теперь тап всегда открывает карточку, фото листаются свайпом (кольцевая карусель),
 * а полоски под фото показывают, сколько их и какое открыто, — и на телефоне, и на
 * десктопе. Наведение на десктопе работает как раньше.
 */

let innerWidth = 1280;

vi.mock('next/link', () => ({
  default: ({ children, href, onClick }) => (
    <a href={href} onClick={onClick}>
      {children}
    </a>
  ),
}));

vi.mock('next-intl', () => ({
  useTranslations: () => (key, values) => (values ? `${key}:${values.count}` : key),
  useLocale: () => 'uk',
}));

vi.mock('react-redux', () => ({
  useDispatch: () => () => {},
  useSelector: () => ({ cart_products: [] }),
}));

vi.mock('@/utils/localeLink', () => ({ useLocalizedLink: () => (p) => p }));
vi.mock('@/svg', () => ({ Cart: () => <i />, QuickView: () => <i /> }));
vi.mock('@/redux/features/productModalSlice', () => ({ handleProductModal: () => ({}) }));
vi.mock('@/redux/features/cartSlice', () => ({
  add_cart_product: () => ({}),
  setCartQuantity: () => ({}),
}));
vi.mock('@/components/common/quantity-input', () => ({ default: () => <div /> }));
vi.mock('@/components/common/BlurImage', () => ({
  default: ({ image, alt }) => <img data-testid="photo" src={image} alt={alt} />,
}));

const ProductItem = (await import('@/components/products/electronics/product-item')).default;

const TWO_PHOTOS = {
  id: 7,
  title: 'Подушка Audi',
  price_minor: 98000,
  residue: 3,
  category: { name: 'Подушки' },
  images: ['/first.jpg', '/second.jpg'],
};

const ONE_PHOTO = { ...TWO_PHOTOS, id: 8, images: ['/only.jpg'] };

beforeEach(() => {
  innerWidth = 1280;
  Object.defineProperty(window, 'innerWidth', {
    configurable: true,
    get: () => innerWidth,
  });
});

const photo = () => screen.getByTestId('photo');
// Полоски лежат в подложке рядом с фото: контейнер → пилюля → полоски.
const bars = () => document.querySelectorAll('[data-testid="photo"] ~ div > span > span');

function swipe(dx) {
  const area = photo().parentElement;
  fireEvent.touchStart(area, { touches: [{ clientX: 200, clientY: 100 }] });
  fireEvent.touchMove(area, { touches: [{ clientX: 200 + dx, clientY: 100 }] });
  fireEvent.touchEnd(area, { changedTouches: [{ clientX: 200 + dx, clientY: 100 }] });
}

describe('полоски-индикаторы', () => {
  it('показываются, когда фото несколько', () => {
    render(<ProductItem product={TWO_PHOTOS} />);

    expect(bars()).toHaveLength(2);
  });

  it('не показываются, когда фото одно', () => {
    render(<ProductItem product={ONE_PHOTO} />);

    expect(bars()).toHaveLength(0);
  });

  it('не перехватывают тап — иначе карточка не откроется', () => {
    render(<ProductItem product={TWO_PHOTOS} />);

    bars().forEach((bar) => {
      expect(bar.parentElement.parentElement.style.pointerEvents).toBe('none');
    });
  });
});

describe('свайп по фото', () => {
  it('листает вперёд', () => {
    render(<ProductItem product={TWO_PHOTOS} />);

    swipe(-80);

    expect(photo().getAttribute('src')).toBe('/second.jpg');
  });

  it('карусель кольцевая: в одну сторону можно листать сколько угодно', () => {
    render(<ProductItem product={TWO_PHOTOS} />);

    swipe(-80);
    swipe(-80);
    expect(photo().getAttribute('src')).toBe('/first.jpg');

    swipe(-80);
    expect(photo().getAttribute('src')).toBe('/second.jpg');
  });

  it('листает назад', () => {
    render(<ProductItem product={TWO_PHOTOS} />);

    swipe(80);

    expect(photo().getAttribute('src')).toBe('/second.jpg');
  });

  it('вертикальное движение не листает — это прокрутка страницы', () => {
    render(<ProductItem product={TWO_PHOTOS} />);

    const area = photo().parentElement;
    fireEvent.touchStart(area, { touches: [{ clientX: 200, clientY: 100 }] });
    fireEvent.touchMove(area, { touches: [{ clientX: 205, clientY: 300 }] });
    fireEvent.touchEnd(area, { changedTouches: [{ clientX: 205, clientY: 300 }] });

    expect(photo().getAttribute('src')).toBe('/first.jpg');
  });
});

describe('тап и свайп различаются', () => {
  it('тап открывает карточку', () => {
    render(<ProductItem product={TWO_PHOTOS} />);

    const link = photo().closest('a');
    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    link.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(false);
  });

  it('свайп карточку не открывает', () => {
    render(<ProductItem product={TWO_PHOTOS} />);

    swipe(-80);

    const link = photo().closest('a');
    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    link.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
  });

  it('тап после свайпа снова открывает карточку', () => {
    render(<ProductItem product={TWO_PHOTOS} />);

    swipe(-80);
    const link = photo().closest('a');
    link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

    const second = new MouseEvent('click', { bubbles: true, cancelable: true });
    link.dispatchEvent(second);

    expect(second.defaultPrevented).toBe(false);
  });

  it('у товара с одним фото тап открывает карточку всегда', () => {
    render(<ProductItem product={ONE_PHOTO} />);

    swipe(-80);

    const link = photo().closest('a');
    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    link.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(false);
  });
});

describe('десктоп: наведение работает как раньше', () => {
  it('показывает второе фото и возвращает первое', () => {
    render(<ProductItem product={TWO_PHOTOS} />);

    const area = photo().parentElement;
    fireEvent.mouseEnter(area);
    expect(photo().getAttribute('src')).toBe('/second.jpg');

    fireEvent.mouseLeave(area);
    expect(photo().getAttribute('src')).toBe('/first.jpg');
  });
});
