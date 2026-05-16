import React from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { useLocale } from 'next-intl';
// internal
import { Box, DeliveryTwo, Processing, Truck } from "@/svg";
import { userLoggedOut } from "@/redux/features/auth/authSlice";
import { useLazyTelegramLinkQuery, useGetUserQuery } from "@/redux/features/auth/authApi";
import { notifyError } from "@/utils/toast";

const NavProfileTab = ({ orderData }) => {
  const { user } = useSelector((state) => state.auth);
  const locale = useLocale();
  const dispatch = useDispatch();
  const router = useRouter();

  const [getTelegramLink, { isFetching: isLinkLoading }] = useLazyTelegramLinkQuery();

  // Актуализируем профиль при открытии страницы, чтобы telegram_id был свежим
  useGetUserQuery(undefined, { refetchOnMountOrArgChange: true });

  const getLocalizedLink = (link) => {
    if (!link) return '#';
    if (link.startsWith('/')) return `/${locale}${link}`;
    return link;
  };

  const handleLogout = () => {
    dispatch(userLoggedOut());
    router.push(getLocalizedLink('/'));
  };

  const handleTelegramConnect = async () => {
    try {
      const result = await getTelegramLink().unwrap();
      const link = result?.link || result?.url;
      if (link) {
        window.open(link, '_blank');
      } else {
        notifyError('Не вдалося отримати посилання. Спробуйте пізніше.');
      }
    } catch (err) {
      console.error('Failed to get Telegram link:', err);
      notifyError('Не вдалося отримати посилання. Спробуйте пізніше.');
    }
  };

  return (
    <div className="profile__main">
      <div className="profile__main-top pb-80">
        <div className="row align-items-center">
          <div className="col-md-6">
            <div className="profile__main-inner d-flex flex-wrap align-items-center">
              <div className="profile__main-content">
                <h4 className="profile__main-title">Welcome Mr. {user?.name}</h4>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="profile__main-logout text-sm-end">
              <a onClick={handleLogout} className="cursor-pointer tp-logout-btn">
                Logout
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="profile__main-info">
        <div className="row gx-3">
          <div className="col-md-3 col-sm-6">
            <div className="profile__main-info-item">
              <div className="profile__main-info-icon">
                <span>
                  <span className="profile-icon-count profile-download">{orderData?.totalDoc}</span>
                  <Box />
                </span>
              </div>
              <h4 className="profile__main-info-title">Total Order</h4>
            </div>
          </div>
          <div className="col-md-3 col-sm-6">
            <div className="profile__main-info-item">
              <div className="profile__main-info-icon">
                <span>
                  <span className="profile-icon-count profile-order">{orderData?.pending}</span>
                  <Processing />
                </span>
              </div>
              <h4 className="profile__main-info-title">Pending Order</h4>
            </div>
          </div>
          <div className="col-md-3 col-sm-6">
            <div className="profile__main-info-item">
              <div className="profile__main-info-icon">
                <span>
                  <span className="profile-icon-count profile-wishlist">
                    {orderData?.processing}
                  </span>
                  <Truck />
                </span>
              </div>
              <h4 className="profile__main-info-title">Processing Order</h4>
            </div>
          </div>
          <div className="col-md-3 col-sm-6">
            <div className="profile__main-info-item">
              <div className="profile__main-info-icon">
                <span>
                  <span className="profile-icon-count profile-wishlist">
                    {orderData?.delivered}
                  </span>
                  <DeliveryTwo />
                </span>
              </div>
              <h4 className="profile__main-info-title">Complete Order</h4>
            </div>
          </div>
        </div>
      </div>

      {/* Telegram connection block */}
      <div className="profile__telegram mt-40 pt-35" style={{ borderTop: '1px solid #e8ecef' }}>
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
          <div>
            {user?.telegram_id ? (
              <>
                <h5 className="mb-1" style={{ color: '#2ca5e0' }}>
                  ✓ Telegram підключено
                </h5>
                <p className="mb-0" style={{ fontSize: 13, color: '#6c757d' }}>
                  Ви отримуватимете сповіщення про замовлення в боті
                </p>
              </>
            ) : (
              <>
                <h5 className="mb-1">Підключити Telegram</h5>
                <p className="mb-0" style={{ fontSize: 13, color: '#6c757d' }}>
                  Отримуйте сповіщення про статус замовлень у боті
                </p>
              </>
            )}
          </div>
          <button
            type="button"
            onClick={handleTelegramConnect}
            disabled={isLinkLoading}
            className={user?.telegram_id ? 'tp-btn tp-btn-border' : 'tp-btn'}
            style={{ minWidth: 160, whiteSpace: 'nowrap' }}
          >
            {isLinkLoading
              ? 'Завантаження...'
              : user?.telegram_id
              ? 'Змінити Telegram'
              : 'Підключити Telegram'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NavProfileTab;
