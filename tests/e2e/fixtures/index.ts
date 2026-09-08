import { test as base, expect, Page } from '@playwright/test';
import { injectTelegramWebApp } from '../helpers/telegram-webapp';
import type { TelegramUser } from '../helpers/init-data';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN ?? '';
const LOCALE = process.env.LOCALE ?? 'ru';

/** Telegram, которого нет ни у одного аккаунта. Никогда не привязывать — иначе спека 01 сломается. */
export const unknownTelegramUser: TelegramUser = {
  id: Number(process.env.TELEGRAM_UNKNOWN_USER_ID ?? process.env.TELEGRAM_GUEST_USER_ID ?? '111222333'),
  first_name: process.env.TELEGRAM_UNKNOWN_USER_FIRST_NAME ?? 'TestUnknown',
  username: process.env.TELEGRAM_UNKNOWN_USERNAME ?? 'test_unknown_user',
  language_code: LOCALE,
};

/** Telegram, привязанный к SITE_LINKED_EMAIL. */
export const linkedTelegramUser: TelegramUser = {
  id: Number(process.env.TELEGRAM_LINKED_USER_ID ?? '444555666'),
  first_name: 'TestLinked',
  username: 'test_linked_user',
  language_code: LOCALE,
};

/** Второй Telegram того же аккаунта SITE_LINKED_EMAIL (привязывается спеками через API). */
export const secondTelegramUser: TelegramUser = {
  id: Number(process.env.TELEGRAM_SECOND_USER_ID ?? '777888999'),
  first_name: 'TestSecond',
  username: 'test_second_user',
  language_code: LOCALE,
};

type TelegramFixtures = {
  unknownTelegramPage: Page;
  linkedTelegramPage: Page;
  secondTelegramPage: Page;
};

export const test = base.extend<TelegramFixtures>({
  unknownTelegramPage: async ({ page }, use) => {
    await injectTelegramWebApp(page, { botToken: BOT_TOKEN, user: unknownTelegramUser });
    await use(page);
  },
  linkedTelegramPage: async ({ page }, use) => {
    await injectTelegramWebApp(page, { botToken: BOT_TOKEN, user: linkedTelegramUser });
    await use(page);
  },
  secondTelegramPage: async ({ page }, use) => {
    await injectTelegramWebApp(page, { botToken: BOT_TOKEN, user: secondTelegramUser });
    await use(page);
  },
});

export { expect, injectTelegramWebApp };
