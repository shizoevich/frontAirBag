'use client';
import React from 'react';
import { PHONE_PREFIX, composePhone, phoneDigits } from '@/utils/phone';
import '@/styles/phone-input.css';

/**
 * Телефон в одном формате: префикс `+380` нарисован и не редактируется, в поле
 * набираются только цифры, не больше девяти. Наружу уходит полный номер
 * `+380XXXXXXXXX` (или пустая строка, пока ничего не набрано).
 *
 * Вставка любого написания — `0501234567`, `+38 (050) 123 45 67` — сводится к тем
 * же девяти цифрам, так что клиенту не надо думать о формате.
 */
const PhoneInput = React.forwardRef(function PhoneInput(
  { value, onChange, onBlur, name, id, placeholder = '501234567', disabled = false, className = '', invalid = false, ...rest },
  ref
) {
  const digits = phoneDigits(value);

  const handleChange = (event) => {
    onChange?.(composePhone(phoneDigits(event.target.value)));
  };

  const handleKeyDown = (event) => {
    // Печатные символы, кроме цифр, не доходят до поля. Сочетания с Ctrl/Cmd
    // (вставка, выделение) и служебные клавиши проходят как есть.
    if (event.key.length === 1 && !/\d/.test(event.key) && !event.ctrlKey && !event.metaKey) {
      event.preventDefault();
    }
  };

  return (
    <div className={`phone-input${invalid ? ' is-invalid' : ''}${className ? ` ${className}` : ''}`}>
      <span className="phone-input__prefix" aria-hidden="true">{PHONE_PREFIX}</span>
      <input
        {...rest}
        ref={ref}
        id={id}
        name={name}
        type="tel"
        inputMode="numeric"
        autoComplete="tel-national"
        className={`phone-input__digits${rest.inputClassName ? ` ${rest.inputClassName}` : ''}`}
        value={digits}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled}
        aria-label={`${PHONE_PREFIX} ${placeholder}`}
        data-testid="phone-input"
      />
    </div>
  );
});

export default PhoneInput;
