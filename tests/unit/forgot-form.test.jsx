import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const requestPasswordReset = vi.fn();
const notifySuccess = vi.fn();
const notifyError = vi.fn();

vi.mock('next-intl', () => ({
  // Ключи возвращаем как есть — тест проверяет поведение, а не тексты.
  useTranslations: () => (key) => key,
  useLocale: () => 'uk',
}));

vi.mock('@/redux/features/auth/authApi', () => ({
  useRequestPasswordResetMutation: () => [requestPasswordReset, { isLoading: false }],
}));

vi.mock('@/utils/toast', () => ({
  notifySuccess: (...args) => notifySuccess(...args),
  notifyError: (...args) => notifyError(...args),
}));

const ForgotForm = (await import('@/components/forms/forgot-form')).default;

const ok = () => ({ unwrap: () => Promise.resolve({ message: 'ok' }) });
const fail = (error) => ({ unwrap: () => Promise.reject(error) });

function submitWith(email) {
  fireEvent.change(screen.getByLabelText('yourEmail'), { target: { value: email } });
  fireEvent.click(screen.getByRole('button'));
}

describe('ForgotForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('отправляет email вместе с текущей локалью', async () => {
    requestPasswordReset.mockReturnValue(ok());
    render(<ForgotForm />);

    submitWith('user@example.com');

    await waitFor(() => {
      expect(requestPasswordReset).toHaveBeenCalledWith({
        email: 'user@example.com',
        locale: 'uk',
      });
    });
  });

  it('не шлёт запрос при некорректном email', async () => {
    const { container } = render(<ForgotForm />);

    fireEvent.change(screen.getByLabelText('yourEmail'), {
      target: { value: 'not-an-email' },
    });
    // Именно submit, а не клик по кнопке: input type="email" отсекается нативной
    // валидацией браузера раньше, чем сработает yup, и до RHF дело не доходит.
    fireEvent.submit(container.querySelector('form'));

    await waitFor(() => {
      expect(screen.getByText('invalidEmail')).toBeInTheDocument();
    });
    expect(requestPasswordReset).not.toHaveBeenCalled();
  });

  it('после успеха показывает нейтральное сообщение вместо формы', async () => {
    // Анти-энумерация: подтверждение не должно зависеть от того,
    // существует аккаунт или нет.
    requestPasswordReset.mockReturnValue(ok());
    render(<ForgotForm />);

    submitWith('user@example.com');

    await waitFor(() => {
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
    expect(screen.getByText('resetLinkSent')).toBeInTheDocument();
    expect(notifySuccess).toHaveBeenCalledWith('resetLinkSent');
  });

  it('на 429 сообщает про лимит, а не про ошибку сервера', async () => {
    requestPasswordReset.mockReturnValue(fail({ status: 429 }));
    render(<ForgotForm />);

    submitWith('user@example.com');

    await waitFor(() => {
      expect(notifyError).toHaveBeenCalledWith('tooManyRequests');
    });
    // Форма остаётся на месте — попытку можно повторить позже.
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
