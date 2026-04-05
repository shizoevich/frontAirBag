'use client';
import { useMemo } from 'react';
import {
  getTelegramWebApp,
  readTelegramInitData,
  readTelegramInitDataUnsafe,
  getTelegramUser,
  hasTelegramInitData,
} from '@/utils/telegram';

export function useTelegramWebApp() {
  return useMemo(() => {
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
  }, []);
}

export default useTelegramWebApp;
