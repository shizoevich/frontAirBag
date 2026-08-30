import React from 'react';
import { act, render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * После оплаты заказ не становится выполненным.
 *
 * Модалка слала из браузера PATCH {is_paid, is_completed} сразу по успеху
 * monobank. Заказ закрывался ещё до сборки и пропадал из «Активних замовлень»
 * в боте (тот запрашивает is_completed=0), а гонка с вебхуком отменяла
 * синхронизацию предоплатного заказа с RemOnline.
 *
 * Оплату подтверждает вебхук, выполнение решают RemOnline, админ или Новая
 * Почта. Браузер статус не трогает вовсе.
 */

const push = vi.fn();
const dispatch = vi.fn();

vi.mock('next/navigation', () => ({
  useParams: () => ({ locale: 'uk' }),
  useRouter: () => ({ push }),
}));

vi.mock('next-intl', () => ({
  useTranslations: () => Object.assign((key) => key, { has: () => false }),
}));

vi.mock('react-redux', () => ({
  useDispatch: () => dispatch,
}));

vi.mock('@/utils/toast', () => ({
  notifyError: vi.fn(),
  notifyInfo: vi.fn(),
  notifySuccess: vi.fn(),
}));

vi.mock('@/redux/features/cartSlice', () => ({
  clearCart: () => ({ type: 'cart/clear' }),
}));

vi.mock('@/redux/features/paymentsApi', () => ({
  useGetPaymentConfigQuery: () => ({ data: { mode: 'production' } }),
}));

// Ключевое: любая попытка мутации заказа обязана быть заметна.
const updateOrder = vi.fn(() => Promise.resolve({ data: {} }));

vi.mock('@/redux/features/ordersApi', () => ({
  useGetOrderByIdQuery: () => ({ data: undefined }),
  useUpdateOrderMutation: () => [updateOrder, { isLoading: false }],
}));

const PaymentModal = (await import('@/components/checkout/payment-modal')).default;

const ORDER_ID = 113254;

function paymentSucceeded() {
  window.dispatchEvent(
    new MessageEvent('message', {
      origin: window.location.origin,
      data: { type: 'monobank-payment-result', result: 'success' },
    })
  );
}

describe('PaymentModal: успешная оплата', () => {
  beforeEach(() => {
    push.mockClear();
    dispatch.mockClear();
    updateOrder.mockClear();
  });

  it('не помечает заказ выполненным и не трогает его статус вообще', async () => {
    render(
      <PaymentModal
        isOpen
        onClose={() => {}}
        iframeUrl="https://pay.mbnk.biz/x"
        orderId={ORDER_ID}
      />
    );

    await act(async () => {
      paymentSucceeded();
    });

    expect(updateOrder).not.toHaveBeenCalled();
  });

  it('всё так же чистит корзину и уводит на страницу успеха', async () => {
    render(
      <PaymentModal
        isOpen
        onClose={() => {}}
        iframeUrl="https://pay.mbnk.biz/x"
        orderId={ORDER_ID}
      />
    );

    await act(async () => {
      paymentSucceeded();
    });

    expect(dispatch).toHaveBeenCalledWith({ type: 'cart/clear' });
    expect(push).toHaveBeenCalledWith('/uk/order-success?payment=paid');
  });
});
