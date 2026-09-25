/**
 * Город и отделение НП обязательны только для доставки.
 *
 * При самовывозе их поля скрыты, а схема всё равно их требовала: у клиента без
 * сохранённого адреса кнопка «Оформити замовлення» молча не реагировала
 * (клиент 125, 24.09.2026).
 */
import { describe, expect, it } from 'vitest';
import { buildCheckoutSchema } from '@/hooks/use-order-checkout';

const schema = buildCheckoutSchema((key) => key);

const contact = {
  firstName: 'Дмитро',
  lastName: 'Тестовий',
  phone: '+380501234567',
};

const errorPaths = async (values) => {
  try {
    await schema.validate(values, { abortEarly: false });
    return [];
  } catch (e) {
    return e.inner.map((err) => err.path);
  }
};

describe('checkout schema', () => {
  it('самовывоз без города и отделения проходит проверку', async () => {
    expect(await errorPaths({ ...contact, shippingOption: 'pickup', city: '', warehouse: '' })).toEqual([]);
    expect(await errorPaths({ ...contact, shippingOption: 'pickup' })).toEqual([]);
  });

  it('доставка без города и отделения не проходит', async () => {
    const paths = await errorPaths({ ...contact, shippingOption: 'nova_post', city: '', warehouse: '' });
    expect(paths).toEqual(expect.arrayContaining(['city', 'warehouse']));
  });

  it('доставка с городом и отделением проходит', async () => {
    expect(
      await errorPaths({ ...contact, shippingOption: 'nova_post', city: 'Київ', warehouse: 'Відділення №1' })
    ).toEqual([]);
  });

  it('при самовывозе имя и телефон по-прежнему обязательны', async () => {
    const paths = await errorPaths({ shippingOption: 'pickup' });
    expect(paths).toEqual(expect.arrayContaining(['firstName', 'lastName', 'phone']));
    expect(paths).not.toContain('city');
  });
});
