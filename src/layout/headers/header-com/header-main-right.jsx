'use client';
'use client';
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import Image from "next/image";
import { useTranslations } from 'next-intl';
// internal
import useCartInfo from "@/hooks/use-cart-info";
import { CartTwo, Menu, User } from "@/svg";
import { openCartMini } from "@/redux/features/cartSlice";
import { useRouter } from "next/navigation";

const HeaderMainRight = ({ setIsCanvasOpen }) => {
  const t = useTranslations('HeaderMainRight');
  const { user: userInfo } = useSelector((state) => state.auth);
  const { quantity } = useCartInfo();
  const dispatch = useDispatch();
  const router = useRouter();
  
  // Handle cart button click
  const handleCartClick = () => {
    dispatch(openCartMini());
  };
  

  return (
    <div className="tp-header-main-right d-flex align-items-center justify-content-end">
      <div className="tp-header-login d-none d-lg-block">
        <div className="d-flex align-items-center">
          <div className="tp-header-login-icon">
            <span>
              {userInfo?.imageURL ? (
                <Link href="/profile">
                  <Image
                    src={userInfo.imageURL}
                    alt="user img"
                    width={35}
                    height={35}
                  />
                </Link>
              ) : userInfo?.name ? (
                <Link href="/profile">
                  <h2 className="text-uppercase login_text">
                    {userInfo?.name[0]}
                  </h2>
                </Link>
              ) : (
                <User />
              )}
            </span>
          </div>
          <div className="tp-header-login-content d-none d-xl-block">
            {!userInfo?.name && (
              <Link href="/login">
                <span>{t('hello')}</span>
              </Link>
            )}
            {userInfo?.name && <span>{t('helloWithName', { name: userInfo.name })}</span>}
            <div className="tp-header-login-title">
              {!userInfo?.name && <Link href="/login">{t('signIn')}</Link>}
              {userInfo?.name && <Link href="/profile">{t('yourAccount')}</Link>}
            </div>
          </div>
        </div>
      </div>
      <div className="tp-header-action d-flex align-items-center ml-50">
        <div className="tp-header-action-item">
          <button
            onClick={handleCartClick}
            type="button"
            className="tp-header-action-btn cartmini-open-btn"
            aria-label={t('openCart')}
          >
            <CartTwo />
            <span className="tp-header-action-badge">{quantity}</span>
          </button>
        </div>
        <div className="tp-header-action-item d-lg-none">
          <button
            onClick={() => setIsCanvasOpen(true)}
            type="button"
            className="tp-header-action-btn tp-offcanvas-open-btn"
          >
            <Menu />
          </button>
        </div>
      </div>
    </div>
  );
};

export default HeaderMainRight;
