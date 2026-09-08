'use client';
import { useEffect, useState } from 'react';
import {
  getTelegramWebApp,
  readTelegramInitData,
  readTelegramInitDataUnsafe,
  getTelegramUser,
  hasTelegramInitData,
} from '@/utils/telegram';

// Сколько ждать telegram-web-app.js, прежде чем считать, что мы не в Telegram.
const SDK_WAIT_MS = 2_000;
const SDK_POLL_MS = 100;

function readSnapshot(sdkSettled) {
  const webApp = getTelegramWebApp();
  const rawInitData = readTelegramInitData();
  const initDataUnsafe = readTelegramInitDataUnsafe();
  const user = getTelegramUser();
  return {
    webApp,
    rawInitData,
    initDataUnsafe,
    user,
    hasInitData: hasTelegramInitData(rawInitData, initDataUnsafe),
    // SDK либо загрузился, либо мы перестали его ждать: снимок окончательный
    sdkSettled: Boolean(webApp) || sdkSettled,
  };
}

/**
 * Снимок Telegram WebApp SDK.
 *
 * Скрипт SDK подключён в layout с `afterInteractive` и в настоящем мини-аппе
 * может появиться позже первого рендера. Пока его нет, `sdkSettled` false —
 * решать «мы не в Telegram» рано: иначе страница отдаётся анонимной, а вход по
 * Telegram случается уже после неё (так было в живом мини-аппе 08.09.2026).
 * Раньше здесь был `useMemo([])` — значение замораживалось пустым навсегда.
 */
export function useTelegramWebApp() {
  const [snapshot, setSnapshot] = useState(() => readSnapshot(false));

  useEffect(() => {
    let settled = false;
    const refresh = () => setSnapshot(readSnapshot(settled));
    refresh();
    if (getTelegramWebApp()) return undefined;

    const startedAt = Date.now();
    const timer = setInterval(() => {
      if (getTelegramWebApp() || Date.now() - startedAt >= SDK_WAIT_MS) {
        settled = true;
        clearInterval(timer);
        refresh();
      }
    }, SDK_POLL_MS);
    window.addEventListener('telegram-webapp-loaded', refresh);
    return () => {
      clearInterval(timer);
      window.removeEventListener('telegram-webapp-loaded', refresh);
    };
  }, []);

  return snapshot;
}

export default useTelegramWebApp;
