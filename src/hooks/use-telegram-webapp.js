'use client';
import { useEffect, useState } from 'react';
import {
  getTelegramWebApp,
  readTelegramInitData,
  readTelegramInitDataUnsafe,
  getTelegramUser,
  hasTelegramInitData,
} from '@/utils/telegram';

function readSnapshot() {
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
  };
}

/**
 * Снимок Telegram WebApp SDK, который обновляется, когда SDK догружается позже
 * первого рендера. Раньше здесь был `useMemo([])`: значение замораживалось
 * пустым, и вход по Telegram мог не случиться вовсе.
 */
export function useTelegramWebApp() {
  const [snapshot, setSnapshot] = useState(readSnapshot);

  useEffect(() => {
    const refresh = () => setSnapshot(readSnapshot());
    refresh();
    window.addEventListener('telegram-webapp-loaded', refresh);
    return () => window.removeEventListener('telegram-webapp-loaded', refresh);
  }, []);

  return snapshot;
}

export default useTelegramWebApp;
