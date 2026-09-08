'use client';
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import Cookies from "js-cookie";
import { userLoggedIn } from "@/redux/features/auth/authSlice";
import { getAuth } from "@/utils/authStorage";
import useTelegramWebApp from "@/hooks/use-telegram-webapp";
import { buildTelegramInitPayload, runTelegramAuthOnce } from "@/utils/telegram";
import { useTelegramAuthMutation } from "@/redux/features/auth/authApi";

function readStoredAuth() {
    const fromStorage = getAuth();
    if (fromStorage?.accessToken) return fromStorage;
    try {
        const cookieRaw = Cookies.get('userInfo');
        const fromCookie = cookieRaw ? JSON.parse(cookieRaw) : null;
        if (fromCookie?.accessToken) return fromCookie;
    } catch {
        // повреждённый cookie — игнорируем
    }
    return null;
}

/**
 * Восстановление сессии при загрузке.
 *
 * Есть сохранённая сессия — она и есть ответ. Нет — в мини-аппе спрашиваем
 * бэкенд по Telegram: известный аккаунт входит бесшовно, неизвестный остаётся
 * анонимом и смотрит каталог (ADR-0021). Лоадер держится ровно на время этого
 * одного запроса и только когда initData уже на руках; на сайте без Telegram
 * страница отдаётся сразу.
 */
export default function useAuthCheck() {
    const dispatch = useDispatch();
    const [authChecked, setAuthChecked] = useState(false);
    const { rawInitData, hasInitData, sdkSettled } = useTelegramWebApp();
    const [telegramAuth] = useTelegramAuthMutation();

    useEffect(() => {
        const stored = readStoredAuth();
        if (stored?.accessToken) {
            dispatch(userLoggedIn({ accessToken: stored.accessToken, user: stored.user ?? null }));
            setAuthChecked(true);
            return;
        }

        // SDK ещё грузится — рано решать, что мы не в Telegram
        if (!sdkSettled) return;

        const payload = hasInitData ? buildTelegramInitPayload({ rawInitData }) : null;
        if (!payload) {
            setAuthChecked(true);
            return;
        }

        let cancelled = false;
        runTelegramAuthOnce(() => telegramAuth(payload).unwrap().catch(() => null))
            .finally(() => { if (!cancelled) setAuthChecked(true); });
        return () => { cancelled = true; };
    }, [dispatch, hasInitData, rawInitData, sdkSettled, telegramAuth]);

    return authChecked;
}
