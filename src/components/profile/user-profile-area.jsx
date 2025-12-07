'use client';
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from 'next-intl';
import { getAuth } from "@/utils/authStorage";
import Link from "next/link";
import { useGetUserQuery, useUpdateProfileMutation } from "@/redux/features/auth/authApi";
import Loader from "../loader/loader";
import ErrorMsg from "../common/error-msg";
// Используем Font Awesome иконки вместо SVG
import { toast } from "react-toastify";

const UserProfileArea = () => {
  const router = useRouter();
  const t = useTranslations('Profile');
  const profileExtra = useTranslations('ProfileExtra');
  // IMPORTANT: useLocale returns the current locale string (e.g. 'en')
  // Do NOT use useTranslations for locale, it returns a function and will serialize to
  // `function translateFn(...)` if used in a URL, causing malformed paths like
  // /function%20translateFn(...)/login
  const locale = useLocale();
  const [editMode, setEditMode] = useState(false);
  
  // Состояние формы
  const [formData, setFormData] = useState({
    name: '',
    last_name: '',
    phone: '',
    city: '',
    warehouse: '',
    nova_post_address: ''
  });
  
  // Временно отключаем загрузку пользователя - /auth/me/ возвращает HTML
  const { data: userData, isLoading, isError } = useGetUserQuery(undefined, {
    skip: true // TODO: Включить когда бэкенд исправит /auth/me/
  });
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  const { user, accessToken } = useSelector((state) => state.auth);
  
  // Проверяем авторизацию
  useEffect(() => {
    const authData = getAuth();
    const isAuthenticated = authData?.accessToken || accessToken;
    
    if (!isAuthenticated) {
      // Сохраняем текущий URL для редиректа после логина
      localStorage.setItem('redirectAfterLogin', `/${locale}/profile`);
      router.push(`/${locale}/login`);
    }
  }, [router, locale, accessToken]);
  
  // Инициализация данных формы при загрузке пользователя
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        last_name: user.last_name || '',
        phone: user.phone || '',
        city: user.city || '',
        warehouse: user.warehouse || '',
        nova_post_address: user.nova_post_address || ''
      });
    }
  }, [user]);

  // Обработчик для включения режима редактирования
  const handleEditProfile = () => {
    setEditMode(true);
  };

  // Обработчик для отмены редактирования
  const handleCancelEdit = () => {
    setEditMode(false);
    // Сбрасываем форму к исходным значениям
    if (user) {
      setFormData({
        name: user.name || '',
        last_name: user.last_name || '',
        phone: user.phone || '',
        city: user.city || '',
        warehouse: user.warehouse || '',
        nova_post_address: user.nova_post_address || ''
      });
    }
  };
  
  // Обработчик изменения полей формы
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Обработчик отправки формы
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Формируем адрес Новой Почты из города и отделения
      const novaPostAddress = formData.city && formData.warehouse ? 
        `${formData.city}, ${formData.warehouse}` : 
        formData.nova_post_address;
      
      // Отправляем данные на сервер
      await updateProfile({
        ...formData,
        nova_post_address: novaPostAddress
      }).unwrap();
      
      // Показываем уведомление об успешном обновлении
      toast.success(profileExtra('profileUpdateSuccess'));
      
      // Выключаем режим редактирования
      setEditMode(false);
    } catch (error) {
      console.error('Ошибка при обновлении профиля:', error);
      toast.error(error?.data?.message || profileExtra('profileUpdateError'));
    }
  };

  // Рендеринг загрузки
  if (isLoading) {
    return (
      <div
        className="d-flex align-items-center justify-content-center"
        style={{ height: "100vh" }}
      >
        <Loader loading={isLoading} />
      </div>
    );
  }

  // Рендеринг ошибки
  if (!isLoading && isError) {
    return (
      <div
        className="d-flex align-items-center justify-content-center"
        style={{ height: "100vh" }}
      >
        <ErrorMsg msg={t('errorLoadingProfile')} />
      </div>
    );
  }

  return (
    <section className="profile__area pt-20 pb-60">
      <div className="container">
        <div className="profile__inner">
          <div className="row justify-content-center">
            <div className="col-xl-10 col-lg-10">
              <div className="profile__info mb-30 p-4 p-md-5 bg-white rounded-3 shadow-sm">
                <h3 className="profile__info-title border-bottom pb-3 mb-4">{t('personalDetails')}</h3>
                
                {/* Профиль пользователя */}
                <div className="profile__info-content">
                  <div className="row">
                    <div className="col-12 mb-30">
                      <div className="profile__meta d-flex flex-column flex-md-row align-items-center">
                        {/* Аватар пользователя */}
                        <div className="profile__avatar mb-3 mb-md-0 me-md-4">
                          <div className="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white shadow-sm" style={{ width: '100px', height: '100px', fontSize: '2.5rem', background: 'linear-gradient(135deg, #3a7bd5, #00d2ff)' }}>
                            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                            {user?.last_name ? user.last_name.charAt(0).toUpperCase() : ''}
                          </div>
                        </div>
                        <div className="profile__meta-content text-center text-md-start">
                          <h3 className="profile__meta-title mb-2 fs-4">{user?.name} {user?.last_name}</h3>
                          <p className="text-muted mb-0"><i className="far fa-calendar-alt me-2"></i>{t('accountCreated')}: {new Date(user?.date_joined || Date.now()).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Информация о пользователе */}
                    <div className="col-12">
                      <div className="profile__info-card row g-4">
                        <div className="col-md-4">
                          <div className="tp-contact-card d-flex align-items-center gap-3 p-4 rounded-3 shadow-sm border h-100">
                            <div className="tp-contact-icon bg-primary rounded-circle d-flex align-items-center justify-content-center" style={{width: 50, height: 50, flexShrink: 0}}>
                              <i className="far fa-envelope text-white fs-4"></i>
                            </div>
                            <div className="tp-contact-content">
                              <h5 className="mb-2 fs-6 fw-bold">{t('email')}</h5>
                              <p className="text-primary mb-0 small text-break">{user?.email}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="col-md-4">
                          <div className="tp-contact-card d-flex align-items-center gap-3 p-4 rounded-3 shadow-sm border h-100">
                            <div className="tp-contact-icon bg-success rounded-circle d-flex align-items-center justify-content-center" style={{width: 50, height: 50, flexShrink: 0}}>
                              <i className="far fa-phone-alt text-white fs-4"></i>
                            </div>
                            <div className="tp-contact-content">
                              <h5 className="mb-2 fs-6 fw-bold">{t('phone')}</h5>
                              <p className="text-success mb-0 small">{user?.phone || t('notSpecified')}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="col-md-4">
                          <div className="tp-contact-card d-flex align-items-center gap-3 p-4 rounded-3 shadow-sm border h-100">
                            <div className="tp-contact-icon bg-info rounded-circle d-flex align-items-center justify-content-center" style={{width: 50, height: 50, flexShrink: 0}}>
                              <i className="far fa-map-marker-alt text-white fs-4"></i>
                            </div>
                            <div className="tp-contact-content">
                              <h5 className="mb-2 fs-6 fw-bold">{t('novaPostAddress')}</h5>
                              <p className="text-info mb-0 small">{user?.nova_post_address || t('notSpecified')}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Кнопки действий */}
                  <div className="profile__btn mt-40">
                    <div className="row g-3">
                      <div className="col-xxl-6 col-md-6">
                        <button 
                          onClick={handleEditProfile} 
                          className="tp-btn w-100 d-flex align-items-center justify-content-center shadow-sm"
                          disabled={editMode}
                        >
                          <i className="far fa-edit me-2"></i> {t('editProfile')}
                        </button>
                      </div>
                      <div className="col-xxl-6 col-md-6">
                        <Link href={`/${locale}/orders`} className="tp-btn tp-btn-2 w-100 d-flex align-items-center justify-content-center shadow-sm">
                          <i className="fas fa-shopping-bag me-2"></i> {t('myOrders')}
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Форма редактирования профиля */}
                {editMode && (
                  <div className="profile__edit-form mt-40 p-4 p-md-5 bg-white rounded-3 shadow-sm">
                    <h4 className="mb-4 pb-2 border-bottom"><i className="fas fa-user-edit me-2"></i>{t('editProfileInfo')}</h4>
                    <form className="mt-20" onSubmit={handleSubmit}>
                      <div className="row g-4">
                        <div className="col-xxl-6 col-md-6">
                          <div className="profile__input-box">
                            <label className="form-label fw-medium mb-2">{t('firstName')}</label>
                            <div className="profile__input">
                              <input 
                                type="text" 
                                name="name"
                                className="form-control" 
                                placeholder={t('firstName')} 
                                value={formData.name}
                                onChange={handleChange}
                                required
                              />
                            </div>
                          </div>
                        </div>
                        
                        <div className="col-xxl-6 col-md-6">
                          <div className="profile__input-box">
                            <label className="form-label fw-medium mb-2">{t('lastName')}</label>
                            <div className="profile__input">
                              <input 
                                type="text" 
                                name="last_name"
                                className="form-control"
                                placeholder={t('lastName')} 
                                value={formData.last_name}
                                onChange={handleChange}
                                required
                              />
                            </div>
                          </div>
                        </div>
                        
                        <div className="col-xxl-6 col-md-6">
                          <div className="profile__input-box">
                            <label className="form-label fw-medium mb-2">{t('email')}</label>
                            <div className="profile__input">
                              <input 
                                type="email" 
                                className="form-control bg-light"
                                placeholder={t('email')} 
                                value={user?.email || ''}
                                readOnly
                              />
                              <small className="text-muted">{t('emailCannotBeChanged')}</small>
                            </div>
                          </div>
                        </div>
                        
                        <div className="col-xxl-6 col-md-6">
                          <div className="profile__input-box">
                            <label className="form-label fw-medium mb-2">{t('phone')}</label>
                            <div className="profile__input">
                              <input 
                                type="tel" 
                                name="phone"
                                className="form-control"
                                placeholder={t('phone')} 
                                value={formData.phone}
                                onChange={handleChange}
                              />
                            </div>
                          </div>
                        </div>
                        
                        <div className="col-xxl-6 col-md-6">
                          <div className="profile__input-box">
                            <label className="form-label fw-medium mb-2">{t('city')}</label>
                            <div className="profile__input">
                              <input 
                                type="text" 
                                name="city"
                                className="form-control"
                                placeholder={t('city')} 
                                value={formData.city}
                                onChange={handleChange}
                              />
                            </div>
                          </div>
                        </div>
                        
                        <div className="col-xxl-6 col-md-6">
                          <div className="profile__input-box">
                            <label className="form-label fw-medium mb-2">{t('warehouse')}</label>
                            <div className="profile__input">
                              <input 
                                type="text" 
                                name="warehouse"
                                className="form-control"
                                placeholder={t('warehouse')} 
                                value={formData.warehouse}
                                onChange={handleChange}
                              />
                            </div>
                          </div>
                        </div>
                        
                        <div className="col-12 mt-4">
                          <div className="profile__btn">
                            <div className="row g-3">
                              <div className="col-xxl-6 col-md-6">
                                <button 
                                  type="submit" 
                                  className="tp-btn w-100 d-flex align-items-center justify-content-center shadow-sm"
                                  disabled={isUpdating}
                                >
                                  {isUpdating ? (
                                    <>
                                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                      {profileExtra('updating')}
                                    </>
                                  ) : (
                                    <>
                                      <i className="fas fa-save me-2"></i>
                                      {profileExtra('update')}
                                    </>
                                  )}
                                </button>
                              </div>
                              <div className="col-xxl-6 col-md-6">
                                <button 
                                  type="button" 
                                  onClick={handleCancelEdit} 
                                  className="tp-btn tp-btn-2 w-100 d-flex align-items-center justify-content-center shadow-sm"
                                  disabled={isUpdating}
                                >
                                  <i className="fas fa-times me-2"></i>
                                  {t('cancel')}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UserProfileArea;
