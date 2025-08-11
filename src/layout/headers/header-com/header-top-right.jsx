'use client';
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslations } from 'next-intl';
import { userLoggedOut } from "@/redux/features/auth/authSlice";
import LanguageSwitcher from '@/components/common/language-switcher';

// setting
function ProfileSetting() {
  const t = useTranslations('HeaderTopRight');
  const [isActive, setIsActive] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const router = useRouter();

  // handle logout
  const handleLogout = () => {
    dispatch(userLoggedOut());
    router.push('/');
    setIsActive(false);
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
          <Link href="/cart" onClick={() => setIsActive(false)}>{t('cart')}</Link>
        </li>
        <li>
          {!user?.name && <Link href="/login" onClick={() => setIsActive(false)} className="cursor-pointer">{t('login')}</Link>}
          {user?.name && <a onClick={handleLogout} className="cursor-pointer">{t('logout')}</a>}
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
