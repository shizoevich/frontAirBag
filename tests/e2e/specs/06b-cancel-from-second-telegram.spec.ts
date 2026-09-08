/**
 * Сценарий 6b — отменить заказ может любой привязанный Telegram аккаунта
 * (ADR-0021): заказ создан под SITE_LINKED_EMAIL, кабинет открыт вторым
 * Telegram того же аккаунта.
 *
 * Заказ уходит в общую с продом CRM: имя «НЕ ВІДПРАВЛЯТИ», номер +38044….
 */
import { test, expect, secondTelegramUser } from '../fixtures';
import { BASE, apiLogin, createOrder, ensureTelegramLinked, freshPhoneDigits } from '../helpers/api';

const LINKED_EMAIL = process.env.SITE_LINKED_EMAIL ?? '';
const LINKED_PASSWORD = process.env.SITE_LINKED_PASSWORD ?? '';

test.describe('Scenario 6b: cancel from the second Telegram', () => {
  test.skip(!LINKED_EMAIL || !LINKED_PASSWORD, 'SITE_LINKED_EMAIL / SITE_LINKED_PASSWORD not configured');

  test('unpaid order is cancelled from the second linked Telegram', async ({ secondTelegramPage: page, request }) => {
    const token = await apiLogin(request, LINKED_EMAIL, LINKED_PASSWORD);
    await ensureTelegramLinked(request, token, secondTelegramUser);
    const created = await createOrder(request, token, {
      name: 'НЕ ВІДПРАВЛЯТИ', phone: `+380${freshPhoneDigits()}`, description: 'E2E second telegram',
    });
    expect(created.status(), await created.text()).toBe(201);
    const orderId = (await created.json()).id;

    await page.goto(`${BASE}/orders`);
    await expect(page).not.toHaveURL(/\/login/, { timeout: 15_000 });
    const row = page.locator(`tr:has(td:text-is("#${orderId}"))`);
    await expect(row).toBeVisible({ timeout: 15_000 });
    await row.getByRole('button').click();

    await page.getByRole('button', { name: /скасувати замовлення|отменить заказ|cancel order/i }).click();
    const dialog = page.locator('form.p-3');
    await expect(dialog).toBeVisible();
    await dialog.locator('select').selectOption('found_cheaper');
    await dialog.locator('textarea').fill('E2E');
    await dialog.locator('button[type="submit"]').click();

    await expect(page.locator(`tr:has(td:text-is("#${orderId}")) .badge`)).toHaveText(
      /скасовано|отменён|canceled/i, { timeout: 15_000 }
    );
  });
});
