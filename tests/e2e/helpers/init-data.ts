/**
 * Generates a valid Telegram WebApp initData string signed with the bot token.
 * The backend validates this with HMAC-SHA256(secret_key, data_check_string)
 * where secret_key = HMAC-SHA256("WebAppData", bot_token).
 */
import crypto from 'crypto';

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_bot?: boolean;
}

export function generateInitData(botToken: string, user: TelegramUser): string {
  const authDate = Math.floor(Date.now() / 1000).toString();
  const userJson = JSON.stringify(user);

  // All fields that go into data_check_string
  const entries: Record<string, string> = {
    auth_date: authDate,
    user: userJson,
  };

  // Keys must be sorted alphabetically
  const dataCheckString = Object.keys(entries)
    .sort()
    .map((k) => `${k}=${entries[k]}`)
    .join('\n');

  // secret_key = HMAC-SHA256("WebAppData", bot_token)
  const secretKey = crypto
    .createHmac('sha256', 'WebAppData')
    .update(botToken)
    .digest();

  const hash = crypto
    .createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');

  const params = new URLSearchParams({ ...entries, hash });
  return params.toString();
}
