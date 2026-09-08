/**
 * Сценарий 10 — настоящий мини-апп: web.telegram.org → тестовый бот → кнопка
 * меню → iframe с сайтом на Funnel-адресе (scripts/webapp-local.sh).
 *
 * Уровень 1 (спеки 01–09) подделывает SDK; здесь initData настоящий, со своим
 * auth_date, и WebView настоящий. Проверяются два сценария, из-за которых всё
 * началось: открытие неизвестным/известным Telegram и истечение сессии.
 *
 * Только локально: нужны TELEGRAM_PHONE (сессия web.telegram.org сохраняется
 * setup-скриптом в .telegram-session.json) и TELEGRAM_TEST_BOT_USERNAME.
 * В CI не запускается. Селекторы web.telegram.org/k подобраны по текущей
 * вёрстке клиента — при её смене править здесь.
 */
import { test, expect, Frame } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const SESSION_PATH = path.resolve(__dirname, '../.telegram-session.json');
const BOT = process.env.TELEGRAM_TEST_BOT_USERNAME ?? '';
const SITE_URL = process.env.SITE_URL ?? '';
const ENABLED = Boolean(BOT && fs.existsSync(SESSION_PATH));

test.describe('Scenario 10: real Telegram WebApp', () => {
  test.skip(!ENABLED, 'TELEGRAM_TEST_BOT_USERNAME and a saved Telegram session (npm run test:e2e:setup) are required');
  test.use({ storageState: ENABLED ? SESSION_PATH : undefined });
  test.setTimeout(120_000);

  async function openMiniApp(page): Promise<Frame> {
    await page.goto(`https://web.telegram.org/k/#@${BOT}`);
    // Кнопка меню бота — синяя рядом с полем ввода (текст задаётся в BotFather).
    // Клиент дорисовывает её асинхронно, поэтому клик — с повторами.
    const menuButton = page.getByText(/веб магазин|web shop|open app/i).first();
    await menuButton.waitFor({ state: 'attached', timeout: 30_000 });
    const iframe = page.locator(`iframe[src*="${new URL(SITE_URL).host}"]`).first();

    for (let attempt = 1; attempt <= 4; attempt += 1) {
      await page.waitForTimeout(2_500);
      // Обычный клик попадает в перерисовку кнопки — шлём событие элементу напрямую
      if (attempt % 2 === 1) {
        await menuButton.dispatchEvent('click').catch(() => null);
      } else {
        await menuButton.click({ force: true }).catch(() => null);
      }
      // «To launch this web app, you will connect to its website» — Launch
      const confirm = page.locator('.popup.active .popup-button').filter({ hasText: /launch|open|запуст|відкри|откры/i }).first();
      if (await confirm.isVisible({ timeout: 5_000 }).catch(() => false)) await confirm.click();
      const opened = await iframe.waitFor({ state: 'visible', timeout: 15_000 }).then(() => true).catch(() => false);
      if (opened) break;
    }
    await expect(iframe).toBeVisible({ timeout: 5_000 });
    const frame = await (await iframe.elementHandle())!.contentFrame();
    expect(frame).toBeTruthy();
    return frame!;
  }

  test('opening the mini app authenticates by real initData', async ({ page }) => {
    const authCalls: number[] = [];
    page.on('response', async (res) => {
      if (res.url().includes('/api/v2/telegram/auth') && res.request().method() === 'POST') {
        authCalls.push(res.status());
        console.log('telegram/auth:', res.status(), (await res.text().catch(() => '')).slice(0, 200));
      }
    });

    const frame = await openMiniApp(page);

    await expect(frame.locator('#wrapper')).toBeVisible({ timeout: 30_000 });
    await expect.poll(() => authCalls.length, { timeout: 30_000 }).toBeGreaterThan(0);
    // Известный Telegram — 200, неизвестный — 404; главное, что ответ есть и страница живая
    expect([200, 404]).toContain(authCalls[0]);
    expect(authCalls.some((s) => s >= 500)).toBe(false);
  });

  test('expired session is restored without reopening the mini app', async ({ page }) => {
    page.on('response', async (res) => {
      if (res.url().includes('/api/v2/telegram/auth') && res.request().method() === 'POST') {
        console.log('telegram/auth (test 2):', res.status(), (await res.text().catch(() => '')).slice(0, 200));
      }
    });
    const frame = await openMiniApp(page);
    await expect(frame.locator('#wrapper')).toBeVisible({ timeout: 30_000 });
    const storage = await frame.evaluate(() => {
      try { return { ok: true, keys: Object.keys(localStorage), hasToken: Boolean(JSON.parse(localStorage.getItem('userInfo') || '{}').accessToken) }; }
      catch (e: any) { return { ok: false, error: String(e?.message || e) }; }
    });
    console.log('mini-app storage:', JSON.stringify(storage));
    const loggedIn = storage.ok && storage.hasToken;
    test.skip(!loggedIn, 'this Telegram is not linked to any account — link it first (spec 03 flow)');

    await frame.evaluate(() => {
      const raw = JSON.parse(localStorage.getItem('userInfo') || '{}');
      localStorage.setItem('userInfo', JSON.stringify({ ...raw, accessToken: 'expired.access.token', refreshToken: 'dead.refresh.token' }));
    });

    const reauth = page.waitForResponse(
      (res) => res.url().includes('/api/v2/telegram/auth') && res.request().method() === 'POST',
      { timeout: 30_000 }
    );
    // Любой авторизованный запрос: профиль (в узком фрейме ссылки спрятаны в бургер)
    await frame.goto(`${SITE_URL}/${process.env.LOCALE ?? 'uk'}/profile`);
    expect((await reauth).status()).toBe(200);
    await expect(frame.locator('#wrapper')).toBeVisible({ timeout: 30_000 });
    await expect.poll(() => frame.url(), { timeout: 15_000 }).not.toMatch(/\/login/);
    const restored = await frame.evaluate(() => JSON.parse(localStorage.getItem('userInfo') || '{}').accessToken);
    expect(restored).toBeTruthy();
    expect(restored).not.toBe('expired.access.token');
  });
});
