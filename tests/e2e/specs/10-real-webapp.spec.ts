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
const ENABLED = Boolean(process.env.TELEGRAM_PHONE && BOT && fs.existsSync(SESSION_PATH));

test.describe('Scenario 10: real Telegram WebApp', () => {
  test.skip(!ENABLED, 'TELEGRAM_PHONE / TELEGRAM_TEST_BOT_USERNAME / saved Telegram session required');
  test.use({ storageState: ENABLED ? SESSION_PATH : undefined });
  test.setTimeout(120_000);

  async function openMiniApp(page): Promise<Frame> {
    await page.goto(`https://web.telegram.org/k/#@${BOT}`);
    // Кнопка меню бота слева от поля ввода; подтверждение «Open» — в попапе
    const menuButton = page.locator('.btn-menu-toggle, .bot-menu, button:has-text("Open"), button:has-text("Відкрити"), button:has-text("Открыть")').first();
    await menuButton.click({ timeout: 30_000 });
    const confirm = page.getByRole('button', { name: /^(open|відкрити|открыть)$/i });
    if (await confirm.isVisible({ timeout: 5_000 }).catch(() => false)) await confirm.click();

    const iframe = page.locator(`iframe[src*="${new URL(SITE_URL).host}"]`).first();
    await expect(iframe).toBeVisible({ timeout: 30_000 });
    const frame = await (await iframe.elementHandle())!.contentFrame();
    expect(frame).toBeTruthy();
    return frame!;
  }

  test('opening the mini app authenticates by real initData', async ({ page }) => {
    const authCalls: number[] = [];
    page.on('response', (res) => {
      if (res.url().includes('/api/v2/telegram/auth') && res.request().method() === 'POST') authCalls.push(res.status());
    });

    const frame = await openMiniApp(page);

    await expect(frame.locator('#wrapper')).toBeVisible({ timeout: 30_000 });
    await expect.poll(() => authCalls.length, { timeout: 30_000 }).toBeGreaterThan(0);
    // Известный Telegram — 200, неизвестный — 404; главное, что ответ есть и страница живая
    expect([200, 404]).toContain(authCalls[0]);
    expect(authCalls.some((s) => s >= 500)).toBe(false);
  });

  test('expired session is restored without reopening the mini app', async ({ page }) => {
    const frame = await openMiniApp(page);
    await expect(frame.locator('#wrapper')).toBeVisible({ timeout: 30_000 });
    const loggedIn = await frame.evaluate(() => Boolean(JSON.parse(localStorage.getItem('userInfo') || '{}').accessToken));
    test.skip(!loggedIn, 'this Telegram is not linked to any account — link it first (spec 03 flow)');

    await frame.evaluate(() => {
      const raw = JSON.parse(localStorage.getItem('userInfo') || '{}');
      localStorage.setItem('userInfo', JSON.stringify({ ...raw, accessToken: 'expired.access.token', refreshToken: 'dead.refresh.token' }));
    });

    const reauth = page.waitForResponse(
      (res) => res.url().includes('/api/v2/telegram/auth') && res.request().method() === 'POST',
      { timeout: 30_000 }
    );
    // Любой авторизованный запрос: кабинет
    await frame.locator('a[href*="/cabinet"], a[href*="/profile"]').first().click();
    expect((await reauth).status()).toBe(200);
    await expect(frame.locator('#wrapper')).toBeVisible();
    expect(frame.url()).not.toMatch(/\/login/);
  });
});
