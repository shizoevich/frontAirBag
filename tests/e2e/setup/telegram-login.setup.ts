/**
 * One-time setup: logs in to web.telegram.org and saves the browser session
 * so the link-consume test can interact with the real Telegram web client.
 *
 * Run once (headed) before the full suite:
 *   npx playwright test --project=chromium --headed tests/e2e/setup/telegram-login.setup.ts
 *
 * The resulting storageState is saved to tests/e2e/.telegram-session.json
 * and is read by tests that need a real Telegram session.
 *
 * Prerequisites: TELEGRAM_PHONE and TELEGRAM_CLOUD_PASSWORD in tests/e2e/.env
 */
import { test as setup, expect } from '@playwright/test';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const SESSION_PATH = path.resolve(__dirname, '../.telegram-session.json');

setup('log in to web.telegram.org', async ({ page }) => {
  setup.setTimeout(15 * 60_000);
  await page.goto('https://web.telegram.org/k/');

  // Номер, код из Telegram и облачный пароль вводит человек в открывшемся окне:
  // Playwright перехватить одноразовый код не может, а номер в .env не нужен.
  // Если TELEGRAM_PHONE всё же задан — подставим его в форму.
  const phone = process.env.TELEGRAM_PHONE;
  if (phone) {
    await page.getByText(/log in by phone|войти по номеру|увійти за номером/i).click().catch(() => null);
    const input = page.getByPlaceholder(/phone number|номер телефона|номер телефону/i);
    if (await input.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await input.fill(phone);
      await page.keyboard.press('Enter');
    }
  }

  // Без паузы и без Inspector: просто ждём, пока в окне появится список чатов.
  console.log('⏳  Войдите в Telegram в открывшемся окне — сессия сохранится сама, как только появится список чатов (до 10 минут)…');
  // Признак входа в Telegram Web K — ключ user_auth в localStorage; вёрстка
  // списка чатов ненадёжна (на странице входа тоже есть списки).
  await page.waitForFunction(() => Boolean(localStorage.getItem('user_auth')), null, {
    timeout: 10 * 60_000,
    polling: 1_000,
  });
  await page.waitForTimeout(5_000);
  await page.context().storageState({ path: SESSION_PATH });
  console.log(`✅  Telegram session saved to ${SESSION_PATH}`);
});
