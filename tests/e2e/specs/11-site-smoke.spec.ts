/**
 * Сценарий 11 — смоук всего сайта: каждый экран анонимом и под аккаунтом,
 * ошибки консоли и ответы 4xx/5xx нашего API — в отчёт. Поток
 * каталог → товар → корзина → чекаут → вход и выход из аккаунта — строго.
 * На стенде с Funnel страницы с картинками категорий показывают оверлей
 * next/image (хост не в remotePatterns) — это артефакт стенда, не сайта.
 */
import { test, expect, Page } from '@playwright/test';
import { BASE, API_URL } from '../helpers/api';

const EMAIL = process.env.SITE_TEST_EMAIL ?? '';
const PASSWORD = process.env.SITE_TEST_PASSWORD ?? '';
const PUBLIC = ['', '/category', '/cart', '/discounts', '/car-brands', '/airbag-components', '/pyrotechnics', '/about', '/contact', '/returns', '/terms', '/privacy-policy', '/login', '/register', '/forgot', '/search?searchText=airbag'];
const PRIVATE = ['/cabinet', '/orders', '/profile', '/checkout', '/discounts'];
const NOISE = /google-analytics|gtag|youtube|favicon|hydration|Extra attributes|Download the React DevTools|net::ERR_ABORTED|third-party cookie|preload/i;

function watch(page: Page) {
  const problems: string[] = [];
  page.on('console', (m) => { if (m.type() === 'error' && !NOISE.test(m.text())) problems.push(`console: ${m.text().slice(0, 140)}`); });
  page.on('pageerror', (e) => problems.push(`pageerror: ${String(e).slice(0, 140)}`));
  page.on('response', (r) => { if (r.url().startsWith(API_URL) && r.status() >= 400) problems.push(`api ${r.status()} ${r.request().method()} ${r.url().slice(API_URL.length, API_URL.length + 60)}`); });
  return problems;
}

async function visit(page: Page, path: string) {
  const res = await page.goto(`${BASE}${path}`, { waitUntil: 'domcontentloaded', timeout: 45_000 }).catch(() => null);
  await page.waitForTimeout(2500);
  return { status: res?.status() ?? 0, url: page.url() };
}

test.describe('smoke', () => {
  test.setTimeout(240_000);

  test('anonymous pages', async ({ page }) => {
    const problems = watch(page);
    const report: string[] = [];
    for (const p of PUBLIC) {
      const r = await visit(page, p);
      const content = await page.locator('main, #wrapper').first().isVisible().catch(() => false);
      const overlay = await page.evaluate(() => {
        const portal = document.querySelector('nextjs-portal');
        const text = portal?.shadowRoot?.textContent || '';
        return text.includes('Runtime Error') || text.includes('Unhandled') ? text.slice(0, 160).replace(/\s+/g, ' ') : '';
      });
      report.push(`${p || '/'} → ${r.status} ${r.url.replace(BASE, '')} content=${content}${overlay ? ' OVERLAY: ' + overlay : ''}`);
    }
    for (const p of PRIVATE) {
      const r = await visit(page, p);
      report.push(`${p} → ${r.status} ${r.url.replace(BASE, '')}`);
      if (p !== '/discounts') expect(r.url, p).toMatch(/\/login/);
    }
    console.log('ANON\n' + report.join('\n'));
    console.log('ANON problems: ' + JSON.stringify(problems));
  });

  test('catalog → product → cart → checkout redirect', async ({ page }) => {
    const problems = watch(page);
    await visit(page, '/category');
    const link = page.locator('a[href*="/product/"]').first();
    await expect(link).toBeAttached({ timeout: 20_000 });
    const href = await link.getAttribute('href');
    await visit(page, (href || '').replace(BASE, '').replace(/^\/uk/, ''));
    console.log('PRODUCT url', page.url().replace(BASE, ''));
    await expect(page.locator('#wrapper')).toBeVisible();
    const add = page.getByRole('button', { name: /в кошик|додати|купити|add to cart|в корзину/i }).first();
    await expect(add).toBeVisible({ timeout: 15_000 });
    await add.click();
    await page.waitForTimeout(1000);
    await visit(page, '/cart');
    const items = await page.evaluate(() => JSON.parse(localStorage.getItem('cart_products') || '[]').length);
    console.log('CART items', items);
    expect(items).toBeGreaterThan(0);
    await page.getByRole('link', { name: /оформ|checkout/i }).first().click({ timeout: 10_000 }).catch(() => visit(page, '/checkout'));
    await page.waitForURL(/login|checkout/, { timeout: 20_000 }).catch(() => null);
    await page.waitForTimeout(2000);
    console.log('CHECKOUT anon →', page.url().replace(BASE, ''));
    expect(page.url()).toMatch(/\/login/);
    console.log('FLOW problems: ' + JSON.stringify(problems));
  });

  test('logged-in pages', async ({ page }) => {
    test.skip(!EMAIL, 'no test account');
    const problems = watch(page);
    await visit(page, '/login');
    await page.locator('input[name="email"]').fill(EMAIL);
    await page.locator('input[name="password"]').fill(PASSWORD);
    await page.getByRole('button', { name: /sign in|войти|увійти|login/i }).click();
    await expect(page).not.toHaveURL(/\/login/, { timeout: 15_000 });
    const report: string[] = [];
    for (const p of [...PRIVATE, '', '/category', '/cart']) {
      const r = await visit(page, p);
      report.push(`${p || '/'} → ${r.status} ${r.url.replace(BASE, '')}`);
      expect(r.url, p).not.toMatch(/\/login/);
      await expect(page.locator('#wrapper'), p).toBeVisible({ timeout: 15_000 });
    }
    // профиль: режим редактирования с PhoneInput
    await visit(page, '/profile');
    const edit = page.getByRole('button', { name: /редагувати|редактировать|edit/i }).first();
    if (await edit.isVisible({ timeout: 5000 }).catch(() => false)) {
      await edit.click();
      await expect(page.getByTestId('phone-input')).toBeVisible({ timeout: 10_000 });
      report.push('profile edit: PhoneInput ok, value=' + await page.getByTestId('phone-input').inputValue());
    } else report.push('profile edit: кнопка не найдена');
    // выход
    await visit(page, '');
    // Выход: верхняя панель «Налаштування» → «Вийти»
    await page.getByText(/налаштування|настройки|settings/i).first().click({ timeout: 10_000 });
    await page.waitForTimeout(500);
    await page.locator('.tp-setting-list-open a, .tp-setting-list-open button').filter({ hasText: /вийти|выйти|logout/i }).first().click({ timeout: 10_000 });
    await page.waitForTimeout(1500);
    report.push('after logout token=' + await page.evaluate(() => Boolean(JSON.parse(localStorage.getItem('userInfo') || '{}').accessToken)));
    console.log('AUTH\n' + report.join('\n'));
    console.log('AUTH problems: ' + JSON.stringify(problems));
  });
});
