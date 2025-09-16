'use client';
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import ErrorMsg from '../common/error-msg';
import { notifyError, notifySuccess } from '@/utils/toast';
import { useRegisterMutation, useLoginMutation } from '@/redux/features/auth/authApi';
import '@/styles/register-form.css';

const RegisterForm = () => {
  const t = useTranslations('Common');
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [cities, setCities] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [searchCity, setSearchCity] = useState('');
  const [searchWarehouse, setSearchWarehouse] = useState('');
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [showWarehouseDropdown, setShowWarehouseDropdown] = useState(false);

  // Схема валидации в соответствии с API /auth/register/
  const schema = Yup.object().shape({
    name: Yup.string()
      .trim()
      .transform(value => value === '' ? undefined : value)
      .max(255, t('maxCharacters', { count: 255 }))
      .nullable()
      .optional(),
    last_name: Yup.string()
      .trim()
      .transform(value => value === '' ? undefined : value)
      .max(255, t('maxCharacters', { count: 255 }))
      .nullable()
      .optional(),
    email: Yup.string()
      .trim()
      .email(t('invalidEmail'))
      .max(100, t('maxCharacters', { count: 100 }))
      .min(1, t('minCharacters', { count: 1 }))
      .required(t('emailRequired')),
    phone: Yup.string()
      .trim()
      .transform(value => value === '' ? undefined : value)
      .max(20, t('maxCharacters', { count: 20 }))
      .nullable()
      .optional(),
    password: Yup.string()
      .min(1, t('minCharacters', { count: 1 }))
      .required(t('passwordRequired')),
    confirm_password: Yup.string()
      .oneOf([Yup.ref('password'), null], t('passwordsMustMatch'))
      .required(t('confirmPasswordRequired')),
    city: Yup.string()
      .transform(value => value === '' ? undefined : value)
      .nullable()
      .optional(),
    warehouse: Yup.string()
      .transform(value => value === '' ? undefined : value)
      .nullable()
      .optional(),
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
  });

  // Используем RTK Query для регистрации и входа
  const [registerUser, { isLoading: isRegistering }] = useRegisterMutation();
  const [login, { isLoading: isLoggingIn }] = useLoginMutation();
  
  // Общий статус загрузки
  const isLoading = loading || isRegistering || isLoggingIn;

  // Поиск городов через API Новой Почты
  const fetchCities = async () => {
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
  };

  // Поиск отделений Новой Почты
  const fetchWarehouses = async () => {
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

      // Если есть фильтр по отделениям, добавим его
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

      console.log('Warehouse response:', data);

      if (data.success && Array.isArray(data.data)) {
        setWarehouses(data.data);
        setShowWarehouseDropdown(true);
      } else {
        console.error('No warehouses found:', data || {});
        setWarehouses([]);
      }
    } catch (error) {
      console.error('Error searching warehouses:', error);
      setWarehouses([]);
    }
  };

  // Обработка изменения поля города
  const handleCityChange = (e) => {
    const query = e.target.value;
    setSearchCity(query);
  };

  useEffect(() => {
    // Загружаем города при монтировании компонента
    if (searchCity.length >= 2) {
      fetchCities();
    }
  }, [searchCity]);

  useEffect(() => {
    // Загружаем отделения при выборе города
    if (selectedCity) {
      fetchWarehouses();
    }
  }, [selectedCity, searchWarehouse]);
  
  // Используем isRegistering из RTK Query для отслеживания статуса запроса
  useEffect(() => {
    setLoading(isRegistering);
  }, [isRegistering]);

  // Обработка выбора города
  const handleCitySelect = (city) => {
    // В ответе searchSettlements корректный идентификатор города для складов — это DeliveryCity
    const cityRef = city.DeliveryCity || city.CityRef || city.Ref || city.SettlementRef;
    setSelectedCity(cityRef || '');
    setValue('city', city.Present);
    setSearchCity(city.Present);
    setShowCityDropdown(false);
    if (cityRef) {
      // Вызываем fetchWarehouses вместо searchWarehouses
      fetchWarehouses();
    } else {
      console.warn('CityRef is missing on selected city item:', city);
      setWarehouses([]);
      setShowWarehouseDropdown(false);
    }
  };

  // Обработка изменения поля отделения
  const handleWarehouseChange = (e) => {
    setSearchWarehouse(e.target.value);
    setShowWarehouseDropdown(true);
  };

  // Обработка выбора отделения
  const handleWarehouseSelect = (warehouse) => {
    setValue('warehouse', warehouse.Description);
    setSearchWarehouse(warehouse.Description);
    setShowWarehouseDropdown(false);
  };

  // Отправка формы
  const locale = useLocale();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      // Формируем данные для отправки в API
      // Формируем адрес Новой Почты из города и отделения, если они выбраны
      let novaPostAddress = null;
      if (data.city && data.warehouse) {
        novaPostAddress = `${data.city}, ${data.warehouse}`;
      }
      
      // Формируем данные для отправки в API
      // Удаляем пустые или undefined поля, чтобы не отправлять их на сервер
      const registerData = {
        email: data.email,
        password: data.password,
        confirm_password: data.confirm_password
      };
      
      // Добавляем опциональные поля только если они заполнены
      if (data.name) registerData.name = data.name;
      if (data.last_name) registerData.last_name = data.last_name;
      if (data.phone) registerData.phone = data.phone;
      if (novaPostAddress) registerData.nova_post_address = novaPostAddress;
      
      console.log('Registration data:', registerData);
      
      // Используем RTK Query для регистрации
      const response = await registerUser(registerData).unwrap();
      
      notifySuccess(t('registerSuccess'));
      
      // Автоматически выполняем вход после успешной регистрации
      try {
        await login({
          email: data.email,
          password: data.password,
          remember: false
        }).unwrap();
        
        // Проверяем, есть ли параметр redirect в URL или localStorage
        const urlParams = new URLSearchParams(window.location.search);
        const redirectUrl = urlParams.get('redirect') || localStorage.getItem('redirectAfterLogin');
        
        if (redirectUrl) {
          // Очищаем сохраненный redirect
          localStorage.removeItem('redirectAfterLogin');
          router.push(redirectUrl);
        } else {
          // По умолчанию перенаправляем на главную страницу
          router.push(`/${locale}`);
        }
      } catch (loginError) {
        console.error('Auto-login after registration failed:', loginError);
        // Если автоматический вход не удался, перенаправляем на страницу входа
        router.push(`/${locale}/login`);
      }
      
      reset();
    } catch (error) {
      console.error('Registration error:', error);
      
      // Обрабатываем различные типы ошибок от API
      if (error.data) {
        // Если есть структурированный ответ с ошибками
        const errorData = error.data;
        
        if (errorData.email) {
          notifyError(`Email: ${errorData.email.join(', ')}`);
        } else if (errorData.password) {
          notifyError(`Пароль: ${errorData.password.join(', ')}`);
        } else if (errorData.non_field_errors) {
          notifyError(errorData.non_field_errors.join(', '));
        } else if (errorData.detail) {
          notifyError(errorData.detail);
        } else {
          // Если есть другие поля с ошибками, показываем первое найденное
          const firstErrorField = Object.keys(errorData)[0];
          if (firstErrorField) {
            notifyError(`${firstErrorField}: ${errorData[firstErrorField].join(', ')}`);
          } else {
            notifyError(t('registerFailed'));
          }
        }
      } else {
        // Если нет структурированных данных об ошибке
        notifyError(t('registerFailed'));
      }
      
      setLoading(false);
    }
  };

  // Закрытие выпадающих списков при клике вне них
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.city-dropdown') && !e.target.closest('.city-input')) {
        setShowCityDropdown(false);
      }
      if (!e.target.closest('.warehouse-dropdown') && !e.target.closest('.warehouse-input')) {
        setShowWarehouseDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="tp-login-form">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="tp-login-input-wrapper">
          <div className="tp-login-input-box">
            <div className="tp-login-input-label">
              <label>{t('firstName')}</label>
            </div>
            <div className="tp-login-input">
              <input 
                {...register('name')} 
                placeholder={t('firstName')} 
                type="text" 
              />
            </div>
            {errors.name && <ErrorMsg msg={errors.name.message} />}
          </div>
          
          <div className="tp-login-input-box">
            <div className="tp-login-input-label">
              <label>{t('lastName')}</label>
            </div>
            <div className="tp-login-input">
              <input 
                {...register('last_name')} 
                placeholder={t('lastName')} 
                type="text" 
              />
            </div>
            {errors.last_name && <ErrorMsg msg={errors.last_name.message} />}
          </div>
          
          <div className="tp-login-input-box">
            <div className="tp-login-input-label">
              <label>{t('yourEmail')} <span className="required-star">*</span></label>
            </div>
            <div className="tp-login-input">
              <input 
                {...register('email')} 
                placeholder={t('yourEmail')} 
                type="email" 
              />
            </div>
            {errors.email && <ErrorMsg msg={errors.email.message} />}
          </div>
          
          <div className="tp-login-input-box">
            <div className="tp-login-input-label">
              <label>{t('phoneNumber')}</label>
            </div>
            <div className="tp-login-input">
              <input 
                {...register('phone')} 
                placeholder={t('phoneNumber')} 
                type="tel" 
              />
            </div>
            {errors.phone && <ErrorMsg msg={errors.phone.message} />}
          </div>
          
          <div className="tp-login-input-box">
            <div className="tp-login-input-label">
              <label>{t('password')} <span className="required-star">*</span></label>
            </div>
            <div className="tp-login-input">
              <input 
                {...register('password')} 
                placeholder={t('password')} 
                type="password" 
              />
            </div>
            {errors.password && <ErrorMsg msg={errors.password.message} />}
          </div>
          
          <div className="tp-login-input-box">
            <div className="tp-login-input-label">
              <label>{t('confirmPassword')} <span className="required-star">*</span></label>
            </div>
            <div className="tp-login-input">
              <input 
                {...register('confirm_password')} 
                placeholder={t('confirmPassword')} 
                type="password" 
              />
            </div>
            {errors.confirm_password && <ErrorMsg msg={errors.confirm_password.message} />}
          </div>
          
          <div className="tp-login-input-box">
            <div className="tp-login-input-label">
              <label>{t('city')}</label>
            </div>
            <div className="tp-login-input city-input">
              <input 
                value={searchCity}
                onChange={handleCityChange}
                placeholder={t('city')} 
                type="text" 
              />
              <input {...register('city')} type="hidden" />
            </div>
            {showCityDropdown && cities.length > 0 && (
              <div className="dropdown-list city-dropdown">
                <ul>
                  {cities.map((city, index) => (
                    <li key={index} onClick={() => handleCitySelect(city)}>
                      {city.Present}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {errors.city && <ErrorMsg msg={errors.city.message} />}
          </div>
          
          <div className="tp-login-input-box">
            <div className="tp-login-input-label">
              <label>{t('warehouse')}</label>
            </div>
            <div className="tp-login-input warehouse-input">
              <input 
                value={searchWarehouse}
                onChange={handleWarehouseChange}
                placeholder={t('warehouse')} 
                type="text" 
                disabled={!selectedCity}
              />
              <input {...register('warehouse')} type="hidden" />
            </div>
            {showWarehouseDropdown && warehouses.length > 0 && (
              <div className="dropdown-list warehouse-dropdown">
                <ul>
                  {warehouses
                    .filter(wh => wh.Description.toLowerCase().includes(searchWarehouse.toLowerCase()))
                    .map((warehouse, index) => (
                      <li key={index} onClick={() => handleWarehouseSelect(warehouse)}>
                        {warehouse.Description}
                      </li>
                    ))}
                </ul>
              </div>
            )}
            {errors.warehouse && <ErrorMsg msg={errors.warehouse.message} />}
          </div>


        </div>
        
        <div className="tp-login-bottom mb-15">
          <button type="submit" className="tp-login-btn w-100" disabled={isLoading}>
            {isLoading ? t('registering') : t('register')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegisterForm;
