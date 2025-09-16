'use client';
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslations, useLocale } from 'next-intl';
import { useLogoutMutation } from "@/redux/features/auth/authApi";
import LanguageSwitcher from '@/components/common/language-switcher';

// setting
function ProfileSetting() {
  const t = useTranslations('HeaderTopRight');
  const locale = useLocale();
  const [isActive, setIsActive] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();
  const router = useRouter();
  const pathname = usePathname();

  // Функция для добавления локали к ссылкам
  const getLocalizedLink = (link) => {
    if (!link) return '#';
    if (link.startsWith('/')) {
      return `/${locale}${link}`;
    }
    return link;
  };

  // handle logout
  const handleLogout = () => {
    logout()
      .unwrap()
      .then(() => {
        // Logout всегда успешен на клиенте
        console.log('Logout completed successfully');
      })
      .catch(() => {
        // Игнорируем ошибки сервера, так как клиентский logout уже выполнен
        console.log('Logout completed (server error ignored)');
      })
      .finally(() => {
        setIsActive(false);
        // Перенаправление на главную страницу с учетом локали
        router.push(`/${locale}`);
      });
  }

  return (
    <div className="tp-header-top-menu-item tp-header-setting">
      <span
        onClick={() => setIsActive(!isActive)}
        className="tp-header-setting-toggle"
        id="tp-header-setting-toggle"
      >
        {t('setting')}
      </span>
      <ul className={isActive ? "tp-setting-list-open" : ""}>
        <li>
          <Link href={getLocalizedLink("/profile")} onClick={() => setIsActive(false)}>{t('my_profile')}</Link>
        </li>
        <li>
          <Link href={getLocalizedLink("/orders")} onClick={() => setIsActive(false)}>{t('my_orders')}</Link>
        </li>
        <li>
          <Link href={getLocalizedLink("/cart")} onClick={() => setIsActive(false)}>{t('cart')}</Link>
        </li>
        <li>
          {!user && <Link href={`/${locale}/login`} onClick={() => setIsActive(false)} className="cursor-pointer">{t('login')}</Link>}
          {user && <a onClick={handleLogout} className="cursor-pointer" style={{ opacity: isLoggingOut ? 0.7 : 1 }}>
            {isLoggingOut ? '...' : t('logout')}
          </a>}
        </li>
      </ul>
    </div>
  );
}

const HeaderTopRight = () => {
  return (
    <div className="tp-header-top-menu d-flex align-items-center justify-content-end">
      <LanguageSwitcher />
      <ProfileSetting />
    </div>
  );
};

export default HeaderTopRight;
