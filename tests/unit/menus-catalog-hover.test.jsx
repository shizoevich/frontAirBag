/**
 * Мега-меню каталогу: розкриття рівнів наведенням.
 *
 * Ряди підкатегорій — сусідні блоки під чипом, а не вкладені в нього, і між ними
 * 26 px без жодного інтерактивного елемента. Тому згортання живе на виході з
 * усього мега-меню, а на рівні чипів працює витіснення. Деталі й обґрунтування —
 * docs/specs/catalog-hover-expand.md.
 */
import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('next-intl', () => ({
  useTranslations: () => (key) => key,
  useLocale: () => 'uk',
}));

vi.mock('react-redux', () => ({
  useSelector: (selector) =>
    selector({ auth: { user: null, accessToken: null, isGuest: false } }),
}));

vi.mock('@/redux/features/auth/authApi', () => ({
  useLogoutMutation: () => [vi.fn(() => ({ unwrap: () => Promise.resolve() }))],
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

const treeState = { data: undefined };
vi.mock('@/redux/features/categoryApi', () => ({
  useGetCategoryTreeQuery: () => treeState,
}));

const Menus = (await import('@/layout/headers/header-com/menus')).default;

const leaf = (id, title) => ({ id, title, slug: title.toLowerCase(), children: [] });

// Дерево навмисне не за абеткою: перевіряємо і сортування виводу.
const TREE = [
  {
    id: 10,
    title: 'BMW',
    slug: 'bmw',
    children: [
      { id: 12, title: 'X7', slug: 'x7', children: [leaf(120, 'Подушка')] },
      leaf(11, 'X5'),
    ],
  },
  {
    id: 20,
    title: 'Audi',
    slug: 'audi',
    children: [leaf(21, 'Q7')],
  },
  leaf(30, 'Ремені'),
];

/** Чип цілком — це <span>/<a> з класом tp-cat-chip, а не текстовий вузол. */
const chip = (title) => {
  const label = screen.getByText(title);
  return label.closest('.tp-cat-chip');
};

const chipExists = (title) => screen.queryByText(title) !== null;

/** Ряди підкатегорій у порядку появи. */
const subRows = (container) =>
  Array.from(container.querySelectorAll('.tp-cat-chips-row--sub'));

const arrowOf = (title) => within(chip(title)).getByRole('button');

function renderMenus() {
  treeState.data = TREE;
  return render(<Menus />);
}

describe('розкриття наведенням', () => {
  beforeEach(() => {
    treeState.data = TREE;
  });

  it('дерево ще не завантажене — меню не падає і чипів немає', () => {
    treeState.data = undefined;

    const { container } = render(<Menus />);

    expect(container.querySelectorAll('.tp-cat-chip')).toHaveLength(0);
    expect(subRows(container)).toHaveLength(0);
  });

  it('наведення на чип з дочірніми розкриває рівень без кліку', () => {
    const { container } = renderMenus();

    fireEvent.mouseEnter(chip('BMW'));

    expect(subRows(container)).toHaveLength(1);
    expect(chip('BMW')).toHaveClass('tp-cat-chip--active');
    expect(arrowOf('BMW')).toHaveAttribute('aria-expanded', 'true');
    expect(arrowOf('BMW')).toHaveTextContent('▴');
    expect(chipExists('X5')).toBe(true);
    expect(chipExists('X7')).toBe(true);
  });

  it('підкатегорії виводяться за абеткою', () => {
    const { container } = renderMenus();

    fireEvent.mouseEnter(chip('BMW'));

    const titles = Array.from(
      subRows(container)[0].querySelectorAll('.tp-cat-chip__label')
    ).map((node) => node.textContent);
    expect(titles).toEqual(['X5', 'X7']);
  });

  it('наведення на сусіда того ж рівня витісняє попередню гілку', () => {
    const { container } = renderMenus();
    fireEvent.mouseEnter(chip('BMW'));

    fireEvent.mouseEnter(chip('Audi'));

    expect(subRows(container)).toHaveLength(1);
    expect(chipExists('Q7')).toBe(true);
    expect(chipExists('X5')).toBe(false);
    expect(chip('BMW')).not.toHaveClass('tp-cat-chip--active');
    expect(chip('Audi')).toHaveClass('tp-cat-chip--active');
  });

  it('витіснення прибирає і глибші рівні', () => {
    const { container } = renderMenus();
    fireEvent.mouseEnter(chip('BMW'));
    fireEvent.mouseEnter(chip('X7'));
    expect(subRows(container)).toHaveLength(2);

    fireEvent.mouseEnter(chip('Audi'));

    expect(subRows(container)).toHaveLength(1);
    expect(chipExists('Подушка')).toBe(false);
  });

  it('кожен новий рівень додається під попереднім', () => {
    const { container } = renderMenus();

    fireEvent.mouseEnter(chip('BMW'));
    fireEvent.mouseEnter(chip('X7'));

    expect(subRows(container)).toHaveLength(2);
    expect(chipExists('Подушка')).toBe(true);
  });

  it('чип-лист не розкриває нічого і не згортає чужу гілку', () => {
    const { container } = renderMenus();
    fireEvent.mouseEnter(chip('BMW'));

    fireEvent.mouseEnter(chip('Ремені'));

    expect(subRows(container)).toHaveLength(1);
    expect(chipExists('X5')).toBe(true);
    expect(chip('Ремені').tagName).toBe('A');
  });

  it('повторне наведення на вже відкритий чип нічого не змінює', () => {
    const { container } = renderMenus();
    fireEvent.mouseEnter(chip('BMW'));

    fireEvent.mouseEnter(chip('BMW'));

    expect(subRows(container)).toHaveLength(1);
    expect(arrowOf('BMW')).toHaveAttribute('aria-expanded', 'true');
  });

  it('швидка проводка через кілька чипів лишає стан останнього', () => {
    const { container } = renderMenus();

    fireEvent.mouseEnter(chip('BMW'));
    fireEvent.mouseEnter(chip('Audi'));
    fireEvent.mouseEnter(chip('BMW'));
    fireEvent.mouseEnter(chip('Audi'));

    expect(subRows(container)).toHaveLength(1);
    expect(chipExists('Q7')).toBe(true);
    expect(chipExists('X5')).toBe(false);
  });
});

describe('згортання', () => {
  beforeEach(() => {
    treeState.data = TREE;
  });

  it('вихід з усього мега-меню згортає всі рівні', () => {
    const { container } = renderMenus();
    fireEvent.mouseEnter(chip('BMW'));
    fireEvent.mouseEnter(chip('X7'));

    fireEvent.mouseLeave(container.querySelector('li.has-mega-menu'));

    expect(subRows(container)).toHaveLength(0);
    expect(arrowOf('BMW')).toHaveAttribute('aria-expanded', 'false');
    expect(arrowOf('BMW')).toHaveTextContent('▾');
  });

  it('перехід з чипа в ряд його підкатегорій не згортає ряд', () => {
    // Курсор іде з чипа на 26 px порожнечі й далі в ряд, не залишаючи <li>.
    // React синтезує onMouseLeave з нативного mouseout за relatedTarget, тому
    // моделюємо саме його: піти «в ряд», а не «в нікуди». Без relatedTarget
    // подія читалася б як вихід з усього меню — у браузері такого переходу тут
    // не буває.
    const { container } = renderMenus();
    fireEvent.mouseEnter(chip('BMW'));
    const row = subRows(container)[0];

    fireEvent.mouseOut(chip('BMW'), { relatedTarget: row });
    fireEvent.mouseEnter(row);

    expect(subRows(container)).toHaveLength(1);
    expect(chipExists('X5')).toBe(true);
  });

  it('курсор на порожньому місці всередині меню нічого не згортає', () => {
    // Структурна гарантія критерію 4: згортання живе на <li>, а не на чипі.
    // Зійти з чипа на порожнє місце root-ряду — усе ще всередині мега-меню,
    // тож відкрита гілка має лишитися.
    const { container } = renderMenus();
    fireEvent.mouseEnter(chip('BMW'));
    const rootRow = container.querySelector('.tp-cat-chips-row--root');

    fireEvent.mouseOut(chip('BMW'), { relatedTarget: rootRow });

    expect(subRows(container)).toHaveLength(1);
    expect(chipExists('X5')).toBe(true);
  });
});

describe('клік по стрілці лишається робочим', () => {
  beforeEach(() => {
    treeState.data = TREE;
  });

  it('клік згортає розкрите наведенням і не повертає його назад', () => {
    // Курсор після кліку все ще всередині чипа: onMouseEnter повторно не
    // спрацює, тож рівень має лишитися згорнутим.
    const { container } = renderMenus();
    fireEvent.mouseEnter(chip('BMW'));

    fireEvent.click(arrowOf('BMW'));

    expect(subRows(container)).toHaveLength(0);
    expect(arrowOf('BMW')).toHaveAttribute('aria-expanded', 'false');
  });

  it('клік розкриває згорнуту категорію — керування без hover', () => {
    const { container } = renderMenus();

    fireEvent.click(arrowOf('Audi'));

    expect(subRows(container)).toHaveLength(1);
    expect(chipExists('Q7')).toBe(true);
  });

  it('клік по стрілці не веде на сторінку категорії', () => {
    renderMenus();

    expect(arrowOf('BMW').closest('a')).toBeNull();
    expect(arrowOf('BMW')).toHaveAttribute('type', 'button');
  });

  it('назва категорії лишається посиланням на її сторінку', () => {
    renderMenus();
    fireEvent.mouseEnter(chip('BMW'));

    const label = within(chip('BMW')).getByText('BMW');
    expect(label.tagName).toBe('A');
    expect(label).toHaveAttribute('href', '/uk/category/bmw-10');
  });
});
