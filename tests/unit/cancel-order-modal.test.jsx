/**
 * Модалка скасування замовлення.
 *
 * Головне, що тут перевіряється: вибір мутації за режимом. Якщо оплачене
 * замовлення піде в /cancel/ замість /request-cancel/, бекенд відповість 409, а
 * клієнт побачить незрозумілу помилку замість запиту на розгляд.
 */
import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const cancelMutate = vi.fn();
const requestMutate = vi.fn();
const loadingState = { cancel: false, request: false };

vi.mock('next-intl', () => ({
  // Тексти перевіряти сенсу немає — вони живуть у messages/*.json.
  useTranslations: () => (key) => key,
}));

vi.mock('@/redux/features/ordersApi', () => ({
  useCancelOrderMutation: () => [cancelMutate, { isLoading: loadingState.cancel }],
  useRequestCancelOrderMutation: () => [requestMutate, { isLoading: loadingState.request }],
}));

const CancelOrderModal = (await import('@/components/order/cancel-order-modal')).default;

const ORDER = { id: 77 };

/** RTK Query повертає об'єкт з .unwrap() — мокаємо саме такий контракт. */
const resolved = (value = {}) => ({ unwrap: () => Promise.resolve(value) });
const rejected = (err) => ({ unwrap: () => Promise.reject(err) });

function renderModal(props = {}) {
  const onClose = props.onClose ?? vi.fn();
  const onDone = props.onDone ?? vi.fn();
  const utils = render(
    <CancelOrderModal
      order={props.order ?? ORDER}
      mode={props.mode ?? 'cancel'}
      onClose={onClose}
      onDone={onDone}
    />,
  );
  return { ...utils, onClose, onDone };
}

/** Кнопка підтвердження — єдина submit-кнопка форми; підпис залежить від режиму. */
const submit = () => fireEvent.click(document.querySelector('button[type="submit"]'));

beforeEach(() => {
  vi.clearAllMocks();
  loadingState.cancel = false;
  loadingState.request = false;
  cancelMutate.mockReturnValue(resolved());
  requestMutate.mockReturnValue(resolved());
});

describe('вибір мутації за режимом', () => {
  it('mode="cancel" скасовує напряму', async () => {
    renderModal({ mode: 'cancel' });

    submit();

    await waitFor(() => expect(cancelMutate).toHaveBeenCalledTimes(1));
    expect(requestMutate).not.toHaveBeenCalled();
  });

  it('mode="request" надсилає запит, а не скасовує', async () => {
    renderModal({ mode: 'request' });

    submit();

    await waitFor(() => expect(requestMutate).toHaveBeenCalledTimes(1));
    expect(cancelMutate).not.toHaveBeenCalled();
  });

  it('режим за замовчуванням — пряме скасування', async () => {
    render(<CancelOrderModal order={ORDER} onClose={vi.fn()} onDone={vi.fn()} />);

    submit();

    await waitFor(() => expect(cancelMutate).toHaveBeenCalled());
  });
});

describe('тіло запиту', () => {
  it('надсилає id, обрану причину і коментар', async () => {
    renderModal();

    fireEvent.change(screen.getByLabelText('cancel_reason_label'), {
      target: { value: 'wrong_items' },
    });
    fireEvent.change(screen.getByLabelText('cancel_comment_label'), {
      target: { value: 'не той артикул' },
    });
    submit();

    await waitFor(() => expect(cancelMutate).toHaveBeenCalledWith({
      id: 77,
      reason: 'wrong_items',
      comment: 'не той артикул',
    }));
  });

  it('причина за замовчуванням — перша зі списку, коментар необовʼязковий', async () => {
    renderModal();

    submit();

    await waitFor(() => expect(cancelMutate).toHaveBeenCalledWith({
      id: 77,
      reason: 'changed_mind',
      comment: '',
    }));
  });

  it('пропонує лише клієнтські причини, без адмінських', () => {
    renderModal();

    const options = Array.from(screen.getByLabelText('cancel_reason_label').options)
      .map((o) => o.value);
    expect(options).toEqual([
      'changed_mind', 'found_cheaper', 'wrong_items',
      'delivery_too_long', 'duplicate', 'other',
    ]);
    expect(options).not.toContain('no_contact');
    expect(options).not.toContain('out_of_stock');
  });
});

describe('успішне скасування', () => {
  it('повідомляє батька і закриває модалку', async () => {
    const { onClose, onDone } = renderModal();

    submit();

    await waitFor(() => expect(onDone).toHaveBeenCalled());
    expect(onClose).toHaveBeenCalled();
  });
});

describe('помилка', () => {
  it('показує detail з відповіді бекенда', async () => {
    cancelMutate.mockReturnValue(rejected({ data: { detail: 'Cancellation is not allowed' } }));
    renderModal();

    submit();

    expect(await screen.findByText('Cancellation is not allowed')).toBeInTheDocument();
  });

  it('без detail показує загальний текст', async () => {
    cancelMutate.mockReturnValue(rejected({ status: 500 }));
    renderModal();

    submit();

    expect(await screen.findByText('cancel_failed')).toBeInTheDocument();
  });

  it('НЕ закриває модалку — інакше введене губиться і незрозуміло, чи скасовано', async () => {
    cancelMutate.mockReturnValue(rejected({ status: 500 }));
    const { onClose, onDone } = renderModal();

    submit();

    await screen.findByText('cancel_failed');
    expect(onClose).not.toHaveBeenCalled();
    expect(onDone).not.toHaveBeenCalled();
  });
});

describe('стан відправки', () => {
  it('кнопки заблоковані, поки запит у польоті', () => {
    loadingState.cancel = true;
    renderModal();

    screen.getAllByRole('button').forEach((btn) => {
      // Кнопка-хрестик у шапці лишається активною
      if (btn.getAttribute('aria-label') !== 'cancel_keep_order') {
        expect(btn).toBeDisabled();
      }
    });
  });

  it('режим запиту теж блокує кнопки за своїм isLoading', () => {
    loadingState.request = true;
    renderModal({ mode: 'request' });

    expect(screen.getByText('processing').closest('button')).toBeDisabled();
  });
});

describe('відмова від скасування', () => {
  it('«залишити замовлення» закриває модалку без запитів', () => {
    const { onClose } = renderModal();

    fireEvent.click(screen.getByText('cancel_keep_order'));

    expect(onClose).toHaveBeenCalled();
    expect(cancelMutate).not.toHaveBeenCalled();
    expect(requestMutate).not.toHaveBeenCalled();
  });
});
