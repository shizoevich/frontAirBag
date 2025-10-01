'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslations } from 'next-intl';

const SimplifiedBillingArea = ({ register, errors, user, setValue }) => {
  const t = useTranslations('Checkout');
  
  // Состояние для Nova Poshta API
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
  
  // Refs for inputs
  const cityInputRef = useRef(null);
  const warehouseInputRef = useRef(null);
  

  // Поиск городов через API Новой Почты
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

  // Поиск отделений Новой Почты
  const fetchWarehouses = useCallback(async () => {
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
  }, [selectedCity]);

  // Обработка изменения поля города
  const handleCityChange = (e) => {
    const query = e.target.value;
    setSearchCity(query);
    // При вводе текста считаем, что выбирается новый город
    setSelectedCity('');
    setSelectedCityName('');
    setValue('city', query);
    // Сбрасываем склад и связанные поля
    setSelectedWarehouse('');
    setSelectedWarehouseName('');
    setValue('warehouse', '');
    setWarehouses([]);

    if (query && query.trim().length >= 2) {
      setShowCityDropdown(true);
    } else {
      setShowCityDropdown(false);
    }
  };

  // Обработка выбора города
  const handleCitySelect = (city) => {
    // В ответе searchSettlements корректный идентификатор города для складов — это DeliveryCity
    const cityRef = city.DeliveryCity || city.CityRef || city.Ref || city.SettlementRef;
    setSelectedCity(cityRef || '');
    setSelectedCityName(city.Present);
    setValue('city', city.Present);
    setSearchCity(city.Present);
    setShowCityDropdown(false);
    
    // Сбрасываем выбранное отделение при смене города
    setSelectedWarehouse('');
    setSelectedWarehouseName('');
    setSearchWarehouse('');
    setValue('warehouse', '');
    setWarehouses([]);
    setShowWarehouseDropdown(false);
    
    if (cityRef) {
      // Вызываем fetchWarehouses вместо searchWarehouses
      fetchWarehouses();
    } else {
      console.warn('CityRef is missing on selected city item:', city);
    }
    // Сразу убираем фокус, чтобы избежать повторного открытия и лишних кликов
    cityInputRef.current?.blur();
  };

  // Обработка изменения поля отделения
  const handleWarehouseChange = (e) => {
    setSearchWarehouse(e.target.value);
    setShowWarehouseDropdown(true);
  };

  // Обработка выбора отделения
  const handleWarehouseSelect = (warehouse) => {
    setSelectedWarehouse(warehouse.Ref);
    setSelectedWarehouseName(warehouse.Description);
    setValue('warehouse', warehouse.Description);
    setSearchWarehouse(warehouse.Description);
    setShowWarehouseDropdown(false);
    
    // Формируем полный адрес для сохранения
    const fullAddress = `${selectedCityName}, ${warehouse.Description}`;
    setValue('novaPostAddress', fullAddress);
  };

  // Обработка кликов вне выпадающих списков
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

  // Заполняем поля данными пользователя при загрузке
  useEffect(() => {
    if (user) {
      setValue('firstName', user.first_name || user.name || '');
      setValue('lastName', user.last_name || '');
      setValue('phone', user.phone || '');
      // Если у пользователя есть сохраненный адрес НП, парсим его
      if (user.nova_post_address) {
        setValue('novaPostAddress', user.nova_post_address);
      }
    }
    fetchCities();
  }, [user, setValue]);

  useEffect(() => {
    // Загружаем города при монтировании компонента
    if (searchCity.length >= 2 && !selectedCity) {
      fetchCities();
    }
  }, [searchCity, selectedCity]);

  useEffect(() => {
    // Загружаем отделения при выборе города
    if (selectedCity) {
      fetchWarehouses();
    }
  }, [selectedCity]);

  return (
    <div className="tp-checkout-bill-area">
      <h3 className="tp-checkout-bill-title">{t('billing_details')}</h3>

      <div className="tp-checkout-bill-form">
        <div className="tp-checkout-bill-inner">
          <div className="row">
            {/* First Name */}
            <div className="col-md-6">
              <div className="tp-checkout-input">
                <label>{t('first_name')} *</label>
                <input
                  {...register('firstName', {
                    required: t('first_name_required'),
                  })}
                  type="text"
                  placeholder={t('enter_first_name')}
                />
                {errors?.firstName && (
                  <span className="error-msg">{errors.firstName.message}</span>
                )}
              </div>
            </div>

            {/* Last Name */}
            <div className="col-md-6">
              <div className="tp-checkout-input">
                <label>{t('last_name')} *</label>
                <input
                  {...register('lastName', {
                    required: t('last_name_required'),
                  })}
                  type="text"
                  placeholder={t('enter_last_name')}
                />
                {errors?.lastName && (
                  <span className="error-msg">{errors.lastName.message}</span>
                )}
              </div>
            </div>

            {/* Phone */}
            <div className="col-md-12">
              <div className="tp-checkout-input">
                <label>{t('phone')} *</label>
                <input
                  {...register('phone', {
                    required: t('phone_required'),
                    pattern: {
                      value: /^[\+]?[0-9\(\)\-\s]+$/,
                      message: t('phone_invalid')
                    }
                  })}
                  type="tel"
                  placeholder={t('enter_phone')}
                />
                {errors?.phone && (
                  <span className="error-msg">{errors.phone.message}</span>
                )}
              </div>
            </div>

            {/* Nova Post City */}
            <div className="col-md-6">
              <div className="tp-checkout-input">
                <label>{t('nova_post_city')} *</label>
                <div className="tp-register-input-dropdown">
                  {(() => {
                    const { ref: rhfCityRef, onChange: rhfCityOnChange, ...cityReg } = register('city', { required: t('city_required') });
                    return (
                      <input
                        {...cityReg}
                        ref={(el) => {
                          cityInputRef.current = el;
                          if (typeof rhfCityRef === 'function') rhfCityRef(el);
                          else if (rhfCityRef) rhfCityRef.current = el;
                        }}
                        type="text"
                        placeholder={t('select_city')}
                        value={searchCity}
                        onChange={(e) => {
                          handleCityChange(e);
                          rhfCityOnChange?.(e);
                        }}
                        onFocus={() => {
                          if (cities.length > 0) setShowCityDropdown(true);
                          else if (searchCity.trim().length >= 2) fetchCities();
                        }}
                        onBlur={() => {
                          // Даем onMouseDown на элементе выпадающего списка выполниться раньше blur
                          setTimeout(() => setShowCityDropdown(false), 150);
                        }}
                        autoComplete="off"
                      />
                    );
                  })()}
                  {showCityDropdown && cities.length > 0 && (
                    <div className="tp-register-dropdown">
                      {cities.map((city) => (
                        <div
                          key={city.Ref || city.DeliveryCity || city.SettlementRef || city.Present}
                          className="tp-register-dropdown-item"
                          onMouseDown={(e) => {
                            // предотвращаем blur инпута до выбора
                            e.preventDefault();
                            e.stopPropagation();
                            handleCitySelect(city);
                          }}
                        >
                          {city.Present}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {errors?.city && (
                  <span className="error-msg">{errors.city.message}</span>
                )}
              </div>
            </div>

            {/* Nova Post Warehouse */}
            <div className="col-md-6">
              <div className="tp-checkout-input">
                <label>{t('nova_post_warehouse')} *</label>
                <div className="tp-register-input-dropdown">
                  {(() => {
                    const { ref: rhfWhRef, onChange: rhfWhOnChange, ...whReg } = register('warehouse', { required: t('warehouse_required') });
                    return (
                      <input
                        {...whReg}
                        ref={(el) => {
                          warehouseInputRef.current = el;
                          if (typeof rhfWhRef === 'function') rhfWhRef(el);
                          else if (rhfWhRef) rhfWhRef.current = el;
                        }}
                        type="text"
                        placeholder={t('select_warehouse')}
                        value={searchWarehouse}
                        onChange={(e) => {
                          handleWarehouseChange(e);
                          rhfWhOnChange?.(e);
                        }}
                        disabled={!selectedCity}
                        onFocus={() => {
                          if (warehouses.length > 0) setShowWarehouseDropdown(true);
                        }}
                        onBlur={() => {
                          setTimeout(() => setShowWarehouseDropdown(false), 150);
                        }}
                        autoComplete="off"
                      />
                    );
                  })()}
                  {showWarehouseDropdown && warehouses.length > 0 && (
                    <div className="tp-register-dropdown">
                      {warehouses.map((warehouse) => (
                        <div
                          key={warehouse.Ref}
                          className="tp-register-dropdown-item"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleWarehouseSelect(warehouse);
                          }}
                        >
                          {warehouse.Description}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {errors?.warehouse && (
                  <span className="error-msg">{errors.warehouse.message}</span>
                )}
              </div>
            </div>

            {/* Order Notes */}
            <div className="col-md-12">
              <div className="tp-checkout-input">
                <label>{t('order_notes')}</label>
                <textarea
                  {...register('orderNotes')}
                  placeholder={t('order_notes')}
                  rows="5"
                ></textarea>
                {errors?.orderNotes && (
                  <span className="error-msg">{errors.orderNotes.message}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimplifiedBillingArea;
