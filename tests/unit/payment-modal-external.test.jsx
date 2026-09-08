/**
 * Мини-апп: модалка оплаты — экран ожидания, а не iframe (ADR-0022).
 * Страница Monobank открыта снаружи; здесь опрос заказа и кнопка «открыть ещё раз».
 */
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next/navigation', () => ({
  useParams: () => ({ locale: 'uk' }),
  useRouter: () => ({ push: vi.fn() }),
}));
vi.mock('next-intl', () => ({
  useTranslations: () => Object.assign((key) => key, { has: () => false }),
}));
vi.mock('react-redux', () => ({ useDispatch: () => vi.fn() }));
vi.mock('@/utils/toast', () => ({ notifyError: vi.fn(), notifyInfo: vi.fn(), notifySuccess: vi.fn() }));
vi.mock('@/redux/features/cartSlice', () => ({ clearCart: () => ({ type: 'cart/clear' }) }));
vi.mock('@/redux/features/paymentsApi', () => ({
  useGetPaymentConfigQuery: () => ({ data: { mode: 'test' } }),
}));
vi.mock('@/redux/features/ordersApi', () => ({
  useGetOrderByIdQuery: () => ({ data: { is_paid: false, last_payment_status: '' } }),
}));
const openExternalLink = vi.fn();
vi.mock('@/utils/telegram', () => ({ openExternalLink: (...a) => openExternalLink(...a) }));

const PaymentModal = (await import('@/components/checkout/payment-modal')).default;

describe('PaymentModal external', () => {
  it('показывает ожидание без iframe и умеет открыть страницу снова', () => {
    render(
      <PaymentModal isOpen external iframeUrl="https://pay.monobank.ua/x" orderId={5} onClose={() => {}} />
    );

    expect(screen.getByTestId('payment-waiting')).toBeInTheDocument();
    expect(document.querySelector('iframe')).toBeNull();
    fireEvent.click(screen.getByText('webapp_open_payment_again'));
    expect(openExternalLink).toHaveBeenCalledWith('https://pay.monobank.ua/x');
  });

  it('на сайте — iframe как раньше', () => {
    render(<PaymentModal isOpen iframeUrl="https://pay.monobank.ua/x" orderId={5} onClose={() => {}} />);

    expect(document.querySelector('iframe')?.getAttribute('src')).toBe('https://pay.monobank.ua/x');
    expect(screen.queryByTestId('payment-waiting')).toBeNull();
  });
});
