'use client';
import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import Cookies from "js-cookie";
import { userLoggedIn } from "@/redux/features/auth/authSlice";
import { getAuth } from "@/utils/authStorage";
import useTelegramWebApp from "@/hooks/use-telegram-webapp";
import { buildTelegramInitPayload } from "@/utils/telegram";
import { useTelegramAuthMutation } from "@/redux/features/auth/authApi";

export default function useAuthCheck() {
    const dispatch = useDispatch();
    const [authChecked, setAuthChecked] = useState(false);
    const [requiresTelegramCheck, setRequiresTelegramCheck] = useState(false);
    const telegramAttemptedRef = useRef(false);
    const { rawInitData, hasInitData } = useTelegramWebApp();
    const [telegramAuth] = useTelegramAuthMutation();

    useEffect(() => {
        const lsAuth = getAuth();
        if (lsAuth?.accessToken) {
            dispatch(
                userLoggedIn({
                    accessToken: lsAuth.accessToken,
                    user: lsAuth.user ?? null,
                    isGuest: lsAuth.isGuest ?? false,
                    guestId: lsAuth.guestId ?? null,
                })
            );
            if (!lsAuth.isGuest) {
                // Real user — restore and done
                setAuthChecked(true);
                return;
            }
            // Guest token — restore session but still run Telegram check:
            // the Telegram account may now be linked to a real account.
            setRequiresTelegramCheck(true);
            return;
        }

        try {
            const cookieRaw = Cookies.get('userInfo');
            if (cookieRaw) {
                const auth = JSON.parse(cookieRaw);
                if (auth?.accessToken) {
                    dispatch(
                        userLoggedIn({
                            accessToken: auth.accessToken,
                            user: auth.user ?? null,
                            isGuest: auth.isGuest ?? false,
                            guestId: auth.guestId ?? null,
                        })
                    );
                    if (!auth.isGuest) {
                        setAuthChecked(true);
                        return;
                    }
                    setRequiresTelegramCheck(true);
                    return;
                }
            }
        } catch {
            // повреждённый cookie — игнорируем
        }

        setRequiresTelegramCheck(true);
    }, [dispatch, setAuthChecked]);

    useEffect(() => {
        if (!requiresTelegramCheck || telegramAttemptedRef.current) return;

        if (!hasInitData) {
            setAuthChecked(true);
            return;
        }

        const payload = buildTelegramInitPayload({ rawInitData });
        if (!payload) {
            setAuthChecked(true);
            return;
        }

        telegramAttemptedRef.current = true;
        telegramAuth(payload)
            .unwrap()
            .catch(() => null)
            .finally(() => {
                setAuthChecked(true);
            });
    }, [hasInitData, rawInitData, requiresTelegramCheck, telegramAuth]);

    return authChecked;
}
