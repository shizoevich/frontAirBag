/**
 * Поле телефона: префикс `+380` неизменяем, набираются только девять цифр,
 * наружу уходит `+380XXXXXXXXX`.
 */
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import PhoneInput from '@/components/common/phone-input';

function setup(value = '') {
  const onChange = vi.fn();
  render(<PhoneInput value={value} onChange={onChange} />);
  return { input: screen.getByTestId('phone-input'), onChange };
}

describe('PhoneInput', () => {
  it('префикс нарисован отдельно, в поле — только местные цифры', () => {
    const { input } = setup('+380501234567');
    expect(screen.getByText('+380')).toBeInTheDocument();
    expect(input).toHaveValue('501234567');
  });

  it('ввод цифр отдаёт полный номер', () => {
    const { input, onChange } = setup('');
    fireEvent.change(input, { target: { value: '501' } });
    expect(onChange).toHaveBeenLastCalledWith('+380501');
  });

  it('буквы и пробелы не проходят', () => {
    const { input, onChange } = setup('');
    fireEvent.change(input, { target: { value: '50 1a2' } });
    expect(onChange).toHaveBeenLastCalledWith('+3805012');
  });

  it('вставка номера в любом написании даёт те же девять цифр', () => {
    const { input, onChange } = setup('');
    fireEvent.change(input, { target: { value: '+38 (050) 123-45-67' } });
    expect(onChange).toHaveBeenLastCalledWith('+380501234567');
  });

  it('десятая цифра не принимается', () => {
    const { input, onChange } = setup('+380501234567');
    fireEvent.change(input, { target: { value: '5012345678' } });
    expect(onChange).toHaveBeenLastCalledWith('+380501234567');
  });

  it('стирание всех цифр отдаёт пустую строку — required сработает', () => {
    const { input, onChange } = setup('+380501234567');
    fireEvent.change(input, { target: { value: '' } });
    expect(onChange).toHaveBeenLastCalledWith('');
  });

  it('нажатие буквы отменяется ещё на keydown', () => {
    const { input } = setup('');
    const event = fireEvent.keyDown(input, { key: 'a' });
    expect(event).toBe(false);
    expect(fireEvent.keyDown(input, { key: '5' })).toBe(true);
    expect(fireEvent.keyDown(input, { key: 'Backspace' })).toBe(true);
    expect(fireEvent.keyDown(input, { key: 'v', ctrlKey: true })).toBe(true);
  });
});
