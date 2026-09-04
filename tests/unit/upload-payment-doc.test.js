import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { uploadPaymentDocWithRetry } from '@/utils/upload-payment-doc';

const FILE = { name: 'receipt.png' };

describe('uploadPaymentDocWithRetry', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('повідомляє про успіх з першої спроби', async () => {
    const upload = vi.fn().mockResolvedValue({});

    const ok = await uploadPaymentDocWithRetry(upload, 113278, FILE);

    expect(ok).toBe(true);
    expect(upload).toHaveBeenCalledTimes(1);
    expect(upload).toHaveBeenCalledWith({ orderId: 113278, file: FILE });
  });

  it('повторює після мережевої помилки', async () => {
    const upload = vi
      .fn()
      .mockRejectedValueOnce(new Error('network'))
      .mockResolvedValue({});

    const ok = await uploadPaymentDocWithRetry(upload, 113278, FILE);

    expect(ok).toBe(true);
    expect(upload).toHaveBeenCalledTimes(2);
  });

  it('повертає false, коли всі спроби невдалі', async () => {
    // Замовлення вже створено, тож про невдачу клієнт має дізнатися:
    // іншого способу надіслати квитанцію в нього немає.
    const upload = vi.fn().mockRejectedValue(new Error('boom'));

    const ok = await uploadPaymentDocWithRetry(upload, 113278, FILE);

    expect(ok).toBe(false);
    expect(upload).toHaveBeenCalledTimes(2);
  });
});
