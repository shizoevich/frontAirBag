'use client';
import React, { useEffect, useState, useCallback, useRef } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from 'next-intl';
import { getAuth } from "@/utils/authStorage";
import Link from "next/link";
import {
  useChangePasswordMutation,
  useGetUserQuery,
  useUpdateProfileMutation,
} from "@/redux/features/auth/authApi";
import Loader from "../loader/loader";
import ErrorMsg from "../common/error-msg";
import { notifyError, notifySuccess } from '@/utils/toast';
import '@/styles/register-form.css';

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
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
  });

  // Nova Poshta API state
  const [searchCity, setSearchCity] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedCityName, setSelectedCityName] = useState('');
  const [cities, setCities] = useState([]);
  const [showCityDropdown, setShowCityDropdown] = useState(false);

  const [searchWarehouse, setSearchWarehouse] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [selectedWarehouseName, setSelectedWarehouseName] = useState('');
  const [warehouses, setWarehouses] = useState([]);
  const [showWarehouseDropdown, setShowWarehouseDropdown] = useState(false);

  const cityInputRef = useRef(null);
  const warehouseInputRef = useRef(null);
  
  // Состояние формы
  const [formData, setFormData] = useState({
    name: '',
    last_name: '',
    phone: '',
    city: '',
    warehouse: '',
    nova_post_address: ''
  });
  
  const { user, accessToken } = useSelector((state) => state.auth);
  // Загружаем актуальный профиль с бэкенда при наличии токена
  const { data: userData, isLoading, isError } = useGetUserQuery(undefined, {
    skip: !(getAuth()?.accessToken || accessToken)
  });
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  const [changePassword, { isLoading: isChangingPassword }] = useChangePasswordMutation();
  
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
  
  const profileUser = userData || user;
  const profileName = profileUser?.name || profileUser?.first_name || '';
  const profileLastName = profileUser?.last_name || '';
  const profileEmail = profileUser?.email || '';
  const profilePhone = profileUser?.phone || '';
  const profileNovaAddress = profileUser?.nova_post_address || profileUser?.address || '';
  const profileLogin = profileUser?.login || profileUser?.username || profileEmail;

  // Инициализация данных формы при загрузке пользователя
  useEffect(() => {
    if (profileUser) {
      const parsedAddress = (profileNovaAddress || '').split(',');
      const parsedCity = parsedAddress.shift()?.trim() || '';
      const parsedWarehouse = parsedAddress.join(',').trim();

      setFormData({
        name: profileName,
        last_name: profileLastName,
        phone: profilePhone,
        city: profileUser.city || parsedCity || '',
        warehouse: profileUser.warehouse || parsedWarehouse || '',
        nova_post_address: profileNovaAddress
      });

      setSearchCity(profileUser.city || parsedCity || '');
      setSearchWarehouse(profileUser.warehouse || parsedWarehouse || '');
      setSelectedCityName(profileUser.city || parsedCity || '');
    }
  }, [profileUser, profileName, profileLastName, profilePhone, profileNovaAddress]);

  // Обработчик для включения режима редактирования
  const handleEditProfile = () => {
    setEditMode(true);
  };

  // Обработчик для отмены редактирования
  const handleCancelEdit = () => {
    setEditMode(false);
    // Сбрасываем форму к исходным значениям
    if (profileUser) {
      const parsedAddress = (profileNovaAddress || '').split(',');
      const parsedCity = parsedAddress.shift()?.trim() || '';
      const parsedWarehouse = parsedAddress.join(',').trim();

      setFormData({
        name: profileName,
        last_name: profileLastName,
        phone: profilePhone,
        city: profileUser.city || parsedCity || '',
        warehouse: profileUser.warehouse || parsedWarehouse || '',
        nova_post_address: profileNovaAddress
      });

      setSearchCity(profileUser.city || parsedCity || '');
      setSearchWarehouse(profileUser.warehouse || parsedWarehouse || '');
      setSelectedCityName(profileUser.city || parsedCity || '');
    }
  };

  const handleOpenChangePasswordModal = () => {
    setIsChangePasswordModalOpen(true);
  };

  const handleCloseChangePasswordModal = () => {
    setIsChangePasswordModalOpen(false);
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
    });
  };

  const handlePasswordFieldChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();

    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      notifyError(t('passwordFieldsRequired'));
      return;
    }

    try {
      const result = await changePassword({
        current_password: passwordForm.currentPassword,
        new_password: passwordForm.newPassword,
      }).unwrap();

      notifySuccess(result?.message || t('passwordDataAccepted'));
      handleCloseChangePasswordModal();
    } catch (error) {
      notifyError(
        error?.data?.current_password?.[0] ||
        error?.data?.new_password?.[0] ||
        error?.data?.detail ||
        error?.data?.message ||
        t('profileUpdateError')
      );
    }
  };
  
  // Обработчик изменения полей формы
  const handleChange = (e) => {
    const { name, value } = e.target;
    const normalizedValue = name === 'phone' ? value.replace(/\s+/g, '') : value;
    setFormData(prev => ({
      ...prev,
      [name]: normalizedValue,
    }));
  };

  // Nova Poshta search: cities
  const fetchCities = useCallback(async () => {
    if (searchCity.length < 2) return;

    try {
      const response = await fetch('https://api.novaposhta.ua/v2.0/json/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiKey: '1690358338d20ac90d792f5da5bb1292',
          modelName: 'Address',
          calledMethod: 'searchSettlements',
          methodProperties: {
            CityName: searchCity,
            Limit: 20,
          },
        }),
      });

      const data = await response.json();

      if (data.success && data.data[0]?.Addresses) {
        setCities(data.data[0].Addresses);
        setShowCityDropdown(true);
      } else {
        setCities([]);
      }
    } catch (error) {
      console.error('Error searching cities:', error);
      setCities([]);
    }
  }, [searchCity]);

  // Nova Poshta search: warehouses
  const fetchWarehouses = useCallback(async () => {
    if (!selectedCity) {
      setWarehouses([]);
      setShowWarehouseDropdown(false);
      return;
    }

    try {
      const payload = {
        apiKey: '1690358338d20ac90d792f5da5bb1292',
        modelName: 'AddressGeneral',
        calledMethod: 'getWarehouses',
        methodProperties: {
          CityRef: selectedCity,
          Page: '1',
          Limit: '50',
          Language: 'ua',
        },
      };

      if (searchWarehouse && searchWarehouse.trim().length > 0) {
        payload.methodProperties.FindByString = searchWarehouse.trim();
      }

      const response = await fetch('https://api.novaposhta.ua/v2.0/json/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success && Array.isArray(data.data)) {
        setWarehouses(data.data);
        setShowWarehouseDropdown(true);
      } else {
        setWarehouses([]);
      }
    } catch (error) {
      console.error('Error searching warehouses:', error);
      setWarehouses([]);
    }
  }, [searchWarehouse, selectedCity]);

  const handleCityChange = (e) => {
    const query = e.target.value;
    setSearchCity(query);
    setSelectedCity('');
    setSelectedCityName('');
    setFormData((prev) => ({ ...prev, city: query }));

    setSelectedWarehouse('');
    setSelectedWarehouseName('');
    setSearchWarehouse('');
    setFormData((prev) => ({ ...prev, warehouse: '' }));
    setWarehouses([]);

    if (query && query.trim().length >= 2) {
      setShowCityDropdown(true);
    } else {
      setShowCityDropdown(false);
    }
  };

  const handleCitySelect = (city) => {
    const cityRef = city.DeliveryCity || city.CityRef || city.Ref || city.SettlementRef;
    setSelectedCity(cityRef || '');
    setSelectedCityName(city.Present);
    setSearchCity(city.Present);
    setFormData((prev) => ({ ...prev, city: city.Present }));
    setShowCityDropdown(false);

    setSelectedWarehouse('');
    setSelectedWarehouseName('');
    setSearchWarehouse('');
    setFormData((prev) => ({ ...prev, warehouse: '' }));
    setWarehouses([]);
    setShowWarehouseDropdown(false);

    if (cityRef) {
      fetchWarehouses();
    } else {
      console.warn('CityRef is missing on selected city item:', city);
    }
    cityInputRef.current?.blur();
  };

  const handleWarehouseChange = (e) => {
    setSearchWarehouse(e.target.value);
    setFormData((prev) => ({ ...prev, warehouse: e.target.value }));
    setShowWarehouseDropdown(true);
  };

  const handleWarehouseSelect = (warehouse) => {
    setSelectedWarehouse(warehouse.Ref);
    setSelectedWarehouseName(warehouse.Description);
    setSearchWarehouse(warehouse.Description);
    setFormData((prev) => ({ ...prev, warehouse: warehouse.Description }));
    setShowWarehouseDropdown(false);
  };

  useEffect(() => {
    if (!selectedCity && selectedCityName) {
      setShowWarehouseDropdown(false);
    }
  }, [selectedCity, selectedCityName]);

  useEffect(() => {
    if (searchCity.length >= 2 && !selectedCity) {
      fetchCities();
    }
  }, [fetchCities, searchCity, selectedCity]);

  useEffect(() => {
    if (selectedCity) {
      fetchWarehouses();
    }
  }, [fetchWarehouses, selectedCity]);

  useEffect(() => {
    if (!selectedCity) return;
    const timer = setTimeout(() => {
      fetchWarehouses();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchWarehouses, searchWarehouse, selectedCity]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.tp-register-input-dropdown')) {
        setShowCityDropdown(false);
        setShowWarehouseDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
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
        id: profileUser?.id,
        data: {
          email: profileEmail,
          name: formData.name,
          last_name: formData.last_name,
          phone: formData.phone,
          nova_post_address: novaPostAddress,
        },
      }).unwrap();
      
      // Показываем уведомление об успешном обновлении
      notifySuccess(profileExtra('profileUpdateSuccess'));
      
      // Выключаем режим редактирования
      setEditMode(false);
    } catch (error) {
      console.error('Ошибка при обновлении профиля:', error);
      notifyError(error?.data?.message || profileExtra('profileUpdateError'));
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
                            {profileName ? profileName.charAt(0).toUpperCase() : 'U'}
                            {profileLastName ? profileLastName.charAt(0).toUpperCase() : ''}
                          </div>
                        </div>
                        <div className="profile__meta-content text-center text-md-start">
                          <h3 className="profile__meta-title mb-2 fs-4">{profileName} {profileLastName}</h3>
                          <p className="text-muted mb-0"><i className="far fa-user me-2"></i>{profileLogin || t('notSpecified')}</p>
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
                              <p className="text-primary mb-0 small text-break">{profileEmail || t('notSpecified')}</p>
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
                              <p className="text-success mb-0 small">{profilePhone || t('notSpecified')}</p>
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
                              <p className="text-info mb-0 small">{profileNovaAddress || t('notSpecified')}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Кнопки действий */}
                  <div className="profile__btn mt-40">
                    <div className="row g-3">
                      <div className="col-xxl-4 col-md-6">
                        <button 
                          onClick={handleEditProfile} 
                          className="tp-btn w-100 d-flex align-items-center justify-content-center shadow-sm"
                          disabled={editMode}
                        >
                          <i className="far fa-edit me-2"></i> {t('editProfile')}
                        </button>
                      </div>
                      <div className="col-xxl-4 col-md-6">
                        <button
                          type="button"
                          onClick={handleOpenChangePasswordModal}
                          className="tp-btn tp-btn-2 w-100 d-flex align-items-center justify-content-center shadow-sm"
                        >
                          <i className="fas fa-key me-2"></i> {t('changePassword')}
                        </button>
                      </div>
                      <div className="col-xxl-4 col-md-12">
                        <Link href={`/${locale}/orders`} className="tp-btn tp-btn-2 w-100 d-flex align-items-center justify-content-center shadow-sm">
                          <i className="fas fa-shopping-bag me-2"></i> {t('myOrders')}
                        </Link>
                      </div>
                    </div>
                  </div>

                  {isChangePasswordModalOpen && (
                    <div
                      className="tp-modal-overlay"
                      role="dialog"
                      aria-modal="true"
                      aria-label={t('changePasswordModalTitle')}
                      onMouseDown={(e) => {
                        if (e.target === e.currentTarget) {
                          handleCloseChangePasswordModal();
                        }
                      }}
                      style={{
                        position: 'fixed',
                        inset: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        zIndex: 9999,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '16px',
                      }}
                    >
                      <div
                        className="tp-modal-content bg-white rounded-3 shadow"
                        style={{
                          width: '100%',
                          maxWidth: '520px',
                        }}
                      >
                        <div className="tp-modal-header d-flex justify-content-between align-items-center p-4 border-bottom">
                          <h4 className="mb-0">{t('changePasswordModalTitle')}</h4>
                          <button
                            type="button"
                            className="btn-close"
                            onClick={handleCloseChangePasswordModal}
                            aria-label={t('close')}
                          />
                        </div>

                        <form onSubmit={handleChangePasswordSubmit} className="p-4">
                          <div className="mb-3">
                            <label htmlFor="currentPassword" className="form-label fw-medium">
                              {t('currentPassword')}
                            </label>
                            <input
                              id="currentPassword"
                              name="currentPassword"
                              type="password"
                              className="form-control"
                              value={passwordForm.currentPassword}
                              onChange={handlePasswordFieldChange}
                              required
                            />
                          </div>

                          <div className="mb-4">
                            <label htmlFor="newPassword" className="form-label fw-medium">
                              {t('newPassword')}
                            </label>
                            <input
                              id="newPassword"
                              name="newPassword"
                              type="password"
                              className="form-control"
                              value={passwordForm.newPassword}
                              onChange={handlePasswordFieldChange}
                              required
                            />
                          </div>

                          <div className="d-flex gap-2 justify-content-end">
                            <button
                              type="button"
                              className="tp-btn tp-btn-2"
                              onClick={handleCloseChangePasswordModal}
                              disabled={isChangingPassword}
                            >
                              {t('cancel')}
                            </button>
                            <button type="submit" className="tp-btn" disabled={isChangingPassword}>
                              {isChangingPassword ? profileExtra('updating') : t('savePassword')}
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}
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
                                value={profileEmail}
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
                            <div className="tp-login-input city-input" style={{ position: 'relative' }}>
                              <input
                                ref={cityInputRef}
                                type="text"
                                placeholder={t('city')}
                                value={searchCity}
                                onChange={handleCityChange}
                                onFocus={() => {
                                  if (cities.length > 0) setShowCityDropdown(true);
                                  else if (searchCity.trim().length >= 2) fetchCities();
                                }}
                                autoComplete="off"
                              />
                              {showCityDropdown && cities.length > 0 && (
                                <div className="dropdown-list city-dropdown">
                                  <ul>
                                    {cities.map((city) => (
                                      <li
                                        key={city.Ref || city.DeliveryCity || city.SettlementRef || city.Present}
                                        onMouseDown={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          handleCitySelect(city);
                                        }}
                                      >
                                        {city.Present}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="col-xxl-6 col-md-6">
                          <div className="profile__input-box">
                            <label className="form-label fw-medium mb-2">{t('warehouse')}</label>
                            <div className="tp-login-input warehouse-input" style={{ position: 'relative' }}>
                              <input
                                ref={warehouseInputRef}
                                type="text"
                                placeholder={t('warehouse')}
                                value={searchWarehouse}
                                onChange={handleWarehouseChange}
                                disabled={!selectedCity}
                                onFocus={() => {
                                  if (warehouses.length > 0) setShowWarehouseDropdown(true);
                                  else if (selectedCity) {
                                    setShowWarehouseDropdown(true);
                                    fetchWarehouses();
                                  }
                                }}
                                autoComplete="off"
                              />
                              {showWarehouseDropdown && warehouses.length > 0 && (
                                <div className="dropdown-list warehouse-dropdown">
                                  <ul>
                                    {warehouses.map((warehouse) => (
                                      <li
                                        key={warehouse.Ref}
                                        onMouseDown={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          handleWarehouseSelect(warehouse);
                                        }}
                                      >
                                        {warehouse.Description}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
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
