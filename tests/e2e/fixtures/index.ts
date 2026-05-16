import { test as base, expect } from '@playwright/test';
import { injectTelegramWebApp } from '../helpers/telegram-webapp';
import type { TelegramUser } from '../helpers/init-data';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN ?? '';
const LOCALE = process.env.LOCALE ?? 'ru';

export type TelegramFixtures = {
  /** Page with injected Telegram WebApp (guest — not linked to any account) */
  guestTelegramPage: ReturnType<typeof base.extend> extends { page: infer P } ? P : never;
  /** Page with injected Telegram WebApp for the user already linked in DB */
  linkedTelegramPage: ReturnType<typeof base.extend> extends { page: infer P } ? P : never;
};

export const telegramUser: TelegramUser = {
  id: Number(process.env.TELEGRAM_GUEST_USER_ID ?? '111222333'),
  first_name: process.env.TELEGRAM_GUEST_USER_FIRST_NAME ?? 'TestGuest',
  username: process.env.TELEGRAM_GUEST_USERNAME ?? 'test_guest_user',
  language_code: LOCALE,
};

export const linkedTelegramUser: TelegramUser = {
  id: Number(process.env.TELEGRAM_LINKED_USER_ID ?? '444555666'),
  first_name: 'TestLinked',
  username: 'test_linked_user',
  language_code: LOCALE,
};

export const test = base.extend({
  /** Page with Telegram WebApp injected for guest user */
  guestTelegramPage: async ({ page }, use) => {
    await injectTelegramWebApp(page, { botToken: BOT_TOKEN, user: telegramUser });
    await use(page as any);
  },

  /** Page with Telegram WebApp injected for already-linked user */
  linkedTelegramPage: async ({ page }, use) => {
    await injectTelegramWebApp(page, { botToken: BOT_TOKEN, user: linkedTelegramUser });
    await use(page as any);
  },
});

export { expect };
