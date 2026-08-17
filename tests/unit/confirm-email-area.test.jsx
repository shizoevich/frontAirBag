import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const confirmEmail = vi.fn();
const resendEmailConfirmation = vi.fn();
const notifySuccess = vi.fn();
const notifyError = vi.fn();

const searchParams = { value: new URLSearchParams() };

vi.mock('next/navigation', () => ({
  useSearchParams: () => searchParams.value,
}));

vi.mock('next/link', () => ({
  default: ({ children, href }) => <a href={href}>{children}</a>,
}));

vi.mock('next-intl', () => ({
  // Ключи возвращаем как есть — тест проверяет поведение, а не тексты.
  useTranslations: () => (key) => key,
  useLocale: () => 'uk',
}));

vi.mock('@/redux/features/auth/authApi', () => ({
  useConfirmEmailMutation: () => [confirmEmail, { isLoading: false }],
  useResendEmailConfirmationMutation: () => [resendEmailConfirmation, { isLoading: false }],
}));

vi.mock('@/utils/toast', () => ({
  notifySuccess: (...args) => notifySuccess(...args),
  notifyError: (...args) => notifyError(...args),
}));

vi.mock('@/components/login-register/login-shapes', () => ({
  default: () => null,
}));

const ConfirmEmailArea = (
  await import('@/components/login-register/confirm-email-area')
).default;

const ok = () => ({ unwrap: () => Promise.resolve({ message: 'ok' }) });
const fail = (error) => ({ unwrap: () => Promise.reject(error) });

describe('ConfirmEmailArea', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    searchParams.value = new URLSearchParams();
  });

  it('без токена показывает экран «проверьте почту» и не дёргает подтверждение', async () => {
    render(<ConfirmEmailArea />);

    expect(screen.getByText('checkYourEmailTitle')).toBeInTheDocument();
    expect(confirmEmail).not.toHaveBeenCalled();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('с токеном подтверждает почту и предлагает войти', async () => {
    searchParams.value = new URLSearchParams('token=good-token');
    confirmEmail.mockReturnValue(ok());

    render(<ConfirmEmailArea />);

    await waitFor(() => {
      expect(confirmEmail).toHaveBeenCalledWith({ token: 'good-token' });
    });
    await waitFor(() => {
      expect(screen.getByText('emailConfirmedTitle')).toBeInTheDocument();
    });
    expect(notifySuccess).toHaveBeenCalledWith('emailConfirmedSuccess');
  });

  it('подтверждает ровно один раз при повторном монтировании эффекта', async () => {
    // В dev React монтирует компонент дважды — второй запрос ушёл бы с уже
    // использованным токеном и показал бы ложную ошибку.
    searchParams.value = new URLSearchParams('token=good-token');
    confirmEmail.mockReturnValue(ok());

    const { rerender } = render(<ConfirmEmailArea />);
    rerender(<ConfirmEmailArea />);

    await waitFor(() => {
      expect(confirmEmail).toHaveBeenCalledTimes(1);
    });
  });

  it('на протухшем токене показывает ошибку и форму повторной отправки', async () => {
    searchParams.value = new URLSearchParams('token=dead-token');
    confirmEmail.mockReturnValue(fail({ status: 400, data: { code: 'invalid_token' } }));

    render(<ConfirmEmailArea />);

    await waitFor(() => {
      expect(screen.getByText('confirmationFailedTitle')).toBeInTheDocument();
    });
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('подставляет email из адреса страницы в форму повторной отправки', async () => {
    searchParams.value = new URLSearchParams('email=user%40example.com');
    resendEmailConfirmation.mockReturnValue(ok());

    render(<ConfirmEmailArea />);

    expect(screen.getByLabelText('yourEmail')).toHaveValue('user@example.com');

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(resendEmailConfirmation).toHaveBeenCalledWith({
        email: 'user@example.com',
        locale: 'uk',
      });
    });
  });

  it('после повторной отправки показывает нейтральное сообщение вместо формы', async () => {
    // Анти-энумерация: подтверждение не должно зависеть от того,
    // существует аккаунт или нет.
    searchParams.value = new URLSearchParams('email=user%40example.com');
    resendEmailConfirmation.mockReturnValue(ok());

    render(<ConfirmEmailArea />);
    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
    expect(screen.getByText('confirmationResent')).toBeInTheDocument();
  });

  it('на 429 сообщает про лимит и оставляет форму на месте', async () => {
    searchParams.value = new URLSearchParams('email=user%40example.com');
    resendEmailConfirmation.mockReturnValue(fail({ status: 429 }));

    render(<ConfirmEmailArea />);
    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(notifyError).toHaveBeenCalledWith('tooManyRequests');
    });
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
