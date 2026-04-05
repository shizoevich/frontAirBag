'use client';
import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import Cookies from "js-cookie";
import { userLoggedIn } from "@/redux/features/auth/authSlice";
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
        const localAuth =  Cookies.get('userInfo')

        if (localAuth) {
            const auth = JSON.parse(localAuth);
            if (auth?.accessToken && auth?.user) {
                dispatch(
                    userLoggedIn({
                        accessToken: auth.accessToken,
                        user: auth.user,
                    })
                );
                setAuthChecked(true);
                return;
            }
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
