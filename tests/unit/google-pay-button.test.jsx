import React from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const googlePayMutate = vi.fn();
const paymentConfig = { value: undefined };

vi.mock('next/navigation', () => ({
  useParams: () => ({ locale: 'uk' }),
}));

vi.mock('@/redux/features/paymentsApi', () => ({
  useGooglePayMutation: () => [googlePayMutate, { isLoading: false }],
  useGetPaymentConfigQuery: () => ({
    data: paymentConfig.value,
    isError: paymentConfig.isError ?? false,
  }),
}));

const GooglePayButton = (await import('@/components/checkout/google-pay-button')).default;

const GPAY_SRC = 'https://pay.google.com/gp/p/js/pay.js';

let loadPaymentData;
let paymentsClientCtor;
let capturedOnClick;

function installGooglePaySdk() {
  // Компонент считает SDK загруженным, если тег скрипта уже в DOM.
  const script = document.createElement('script');
  script.src = GPAY_SRC;
  document.head.appendChild(script);

  loadPaymentData = vi.fn().mockResolvedValue({
    paymentMethodData: { tokenizationData: { token: 'g-token-123' } },
  });

  paymentsClientCtor = vi.fn(function PaymentsClient() {
    return {
      loadPaymentData,
      createButton: ({ onClick }) => {
        capturedOnClick = onClick;
        const btn = document.createElement('button');
        btn.textContent = 'Google Pay (mock)';
        btn.addEventListener('click', onClick);
        return btn;
      },
    };
  });

  window.google = { payments: { api: { PaymentsClient: paymentsClientCtor } } };
}

function renderButton(props = {}) {
  return render(
    <GooglePayButton
      amountMinor={15000}
      merchantName="AirbagAD"
      resolveOrderId={props.resolveOrderId ?? vi.fn().mockResolvedValue(42)}
      onResult={props.onResult ?? vi.fn()}
      {...props}
    />
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  document.head.querySelectorAll(`script[src="${GPAY_SRC}"]`).forEach((s) => s.remove());
  paymentConfig.value = {
    mode: 'production',
    google_pay_environment: 'PRODUCTION',
    google_pay_merchant_id: 'merchant-prod',
  };
  paymentConfig.isError = false;
  capturedOnClick = undefined;
  googlePayMutate.mockReturnValue({
    unwrap: () => Promise.resolve({ payment: { status: 'success' }, monobank: {} }),
  });
  installGooglePaySdk();
});

describe('GooglePayButton', () => {
  it('не создаёт PaymentsClient, пока конфиг с бэка не пришёл', async () => {
    paymentConfig.value = undefined;

    renderButton();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Google Pay' })).toBeDisabled();
    });
    expect(paymentsClientCtor).not.toHaveBeenCalled();
  });

  it('не уходит в TEST, если конфиг не загрузился', async () => {
    paymentConfig.value = undefined;
    paymentConfig.isError = true;

    renderButton();

    await waitFor(() => {
      expect(screen.getByText(/конфігурацію оплати/i)).toBeInTheDocument();
    });
    expect(paymentsClientCtor).not.toHaveBeenCalled();
  });

  it('берёт окружение и merchantId с бэка, а не из сборки', async () => {
    renderButton({ gatewayMerchantId: 'merchant-from-build' });

    await waitFor(() => expect(paymentsClientCtor).toHaveBeenCalled());
    expect(paymentsClientCtor.mock.calls[0][0]).toMatchObject({
      environment: 'PRODUCTION',
    });

    await waitFor(() => expect(capturedOnClick).toBeDefined());
    await act(async () => {
      await capturedOnClick();
    });

    const request = loadPaymentData.mock.calls[0][0];
    expect(request.merchantInfo.merchantId).toBe('merchant-prod');
  });

  it('создаёт заказ ПОСЛЕ шита и передаёт order_id в мутацию', async () => {
    const order = [];
    const resolveOrderId = vi.fn(async () => {
      order.push('resolve');
      return 42;
    });
    loadPaymentData.mockImplementation(async () => {
      order.push('sheet');
      return { paymentMethodData: { tokenizationData: { token: 'g-token-123' } } };
    });

    renderButton({ resolveOrderId });
    await waitFor(() => expect(capturedOnClick).toBeDefined());
    await act(async () => {
      await capturedOnClick();
    });

    // Порядок критичен: loadPaymentData обязан вызываться из user gesture,
    // любой await до него ломает открытие окна Google Pay.
    expect(order).toEqual(['sheet', 'resolve']);
    expect(googlePayMutate).toHaveBeenCalledWith(
      expect.objectContaining({ gToken: 'g-token-123', order_id: 42 })
    );
  });

  it('не платит, если заказ создать не удалось', async () => {
    renderButton({ resolveOrderId: vi.fn().mockResolvedValue(null) });
    await waitFor(() => expect(capturedOnClick).toBeDefined());
    await act(async () => {
      await capturedOnClick();
    });

    expect(googlePayMutate).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(screen.getByText(/не вдалося створити замовлення/i)).toBeInTheDocument();
    });
  });

  it('отмена шита пользователем не показывается как ошибка', async () => {
    const cancel = Object.assign(new Error('canceled'), { statusCode: 'CANCELED' });
    loadPaymentData.mockRejectedValue(cancel);

    renderButton();
    await waitFor(() => expect(capturedOnClick).toBeDefined());
    await act(async () => {
      await capturedOnClick();
    });

    expect(googlePayMutate).not.toHaveBeenCalled();
    expect(screen.queryByText(/canceled/i)).not.toBeInTheDocument();
  });

  it('отдаёт ответ бэкенда в onResult вместе с orderId', async () => {
    const onResult = vi.fn();
    const response = { payment: { status: 'success' }, monobank: { invoiceId: 'inv-1' } };
    googlePayMutate.mockReturnValue({ unwrap: () => Promise.resolve(response) });

    renderButton({ onResult });
    await waitFor(() => expect(capturedOnClick).toBeDefined());
    await act(async () => {
      await capturedOnClick();
    });

    expect(onResult).toHaveBeenCalledWith(response, 42);
  });

  it('показывает detail с бэкенда при отказе оплаты', async () => {
    googlePayMutate.mockReturnValue({
      unwrap: () => Promise.reject({ data: { detail: 'Order already paid' } }),
    });

    renderButton();
    await waitFor(() => expect(capturedOnClick).toBeDefined());
    await act(async () => {
      await capturedOnClick();
    });

    await waitFor(() => {
      expect(screen.getByText('Order already paid')).toBeInTheDocument();
    });
  });
});
