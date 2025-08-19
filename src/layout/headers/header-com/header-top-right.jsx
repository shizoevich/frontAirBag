'use client';
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslations } from 'next-intl';
import { useLogoutMutation } from "@/redux/features/auth/authApi";
import LanguageSwitcher from '@/components/common/language-switcher';

// setting
function ProfileSetting() {
  const t = useTranslations('HeaderTopRight');
  const [isActive, setIsActive] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split('/')[1]; // Получаем текущую локаль из URL

  // handle logout
  const handleLogout = () => {
    logout()
      .unwrap()
      .then(() => {
        // Перенаправление на главную страницу с учетом локали
        router.push(`/${locale}`);
      })
      .catch((error) => {
        console.error('Logout error:', error);
      })
      .finally(() => {
        setIsActive(false);
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
          <Link href="/profile" onClick={() => setIsActive(false)}>{t('my_profile')}</Link>
        </li>
        <li>
          <Link href="/orders" onClick={() => setIsActive(false)}>{t('my_orders')}</Link>
        </li>
        <li>
          <Link href="/cart" onClick={() => setIsActive(false)}>{t('cart')}</Link>
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
