'use client';
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { notifyError, notifySuccess } from '@/utils/toast';
import ErrorMsg from '../common/error-msg';
import axios from 'axios';

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

  // Схема валидации
  const schema = Yup.object().shape({
    firstName: Yup.string().required(t('firstNameRequired')),
    lastName: Yup.string().required(t('lastNameRequired')),
    email: Yup.string().email(t('invalidEmail')).required(t('emailRequired')),
    phone: Yup.string().required(t('phoneRequired')),
    password: Yup.string().min(6, t('minCharacters', { count: 6 })).required(t('passwordRequired')),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], t('passwordsMustMatch'))
      .required(t('confirmPasswordRequired')),
    city: Yup.string().required(t('cityRequired')),
    warehouse: Yup.string().required(t('warehouseRequired')),
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

  // Поиск городов через API Новой Почты
  const searchCities = async (query) => {
    if (query.length < 2) return;
    
    try {
      const response = await axios.post('https://api.novaposhta.ua/v2.0/json/', {
        apiKey: '1690358338d20ac90d792f5da5bb1292',
        modelName: 'Address',
        calledMethod: 'searchSettlements',
        methodProperties: {
          CityName: query,
          Limit: 20,
        },
      });
      
      if (response.data.success && response.data.data[0]?.Addresses) {
        setCities(response.data.data[0].Addresses);
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
  const searchWarehouses = async (cityRef) => {
    try {
      const payload = {
        apiKey: '1690358338d20ac90d792f5da5bb1292',
        modelName: 'AddressGeneral',
        calledMethod: 'getWarehouses',
        methodProperties: {
          CityRef: cityRef,
          Page: '1',
          Limit: '50',
          Language: 'ua',
        },
      };

      // Если есть фильтр по отделениям, добавим его
      if (searchWarehouse && searchWarehouse.trim().length > 0) {
        payload.methodProperties.FindByString = searchWarehouse.trim();
      }

      const response = await axios.post('https://api.novaposhta.ua/v2.0/json/', payload);

      console.log('Warehouse response:', response.data);

      if (response.data?.success && Array.isArray(response.data.data)) {
        setWarehouses(response.data.data);
        setShowWarehouseDropdown(true);
      } else {
        console.error('No warehouses found:', response.data || {});
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
    searchCities(query);
  };

  // Обработка выбора города
  const handleCitySelect = (city) => {
    // В ответе searchSettlements корректный идентификатор города для складов — это DeliveryCity
    const cityRef = city.DeliveryCity || city.CityRef || city.Ref || city.SettlementRef;
    setSelectedCity(cityRef || '');
    setValue('city', city.Present);
    setSearchCity(city.Present);
    setShowCityDropdown(false);
    if (cityRef) {
      searchWarehouses(cityRef);
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
  const onSubmit = async (data) => {
    setLoading(true);
    try {
      // Здесь будет вызов API для регистрации
      console.log('Registration data:', data);
      
      // Имитация успешной регистрации
      setTimeout(() => {
        notifySuccess(t('registerSuccess'));
        reset();
        router.push('/login');
        setLoading(false);
      }, 1500);
    } catch (error) {
      console.error('Registration error:', error);
      notifyError(t('registerFailed'));
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
            <div className="tp-login-input">
              <input 
                {...register('firstName')} 
                placeholder={t('firstName')} 
                type="text" 
              />
            </div>
            {errors.firstName && <ErrorMsg msg={errors.firstName.message} />}
          </div>
          
          <div className="tp-login-input-box">
            <div className="tp-login-input">
              <input 
                {...register('lastName')} 
                placeholder={t('lastName')} 
                type="text" 
              />
            </div>
            {errors.lastName && <ErrorMsg msg={errors.lastName.message} />}
          </div>
          
          <div className="tp-login-input-box">
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
            <div className="tp-login-input">
              <input 
                {...register('confirmPassword')} 
                placeholder={t('confirmPassword')} 
                type="password" 
              />
            </div>
            {errors.confirmPassword && <ErrorMsg msg={errors.confirmPassword.message} />}
          </div>
          
          <div className="tp-login-input-box">
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
          <button type="submit" className="tp-login-btn w-100">
            {loading ? t('registering') : t('register')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegisterForm;
