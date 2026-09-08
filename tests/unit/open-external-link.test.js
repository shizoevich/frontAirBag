/**
 * Страница оплаты из мини-аппа открывается снаружи WebView (ADR-0022):
 * Apple Pay и Google Pay внутри Telegram не работают.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { openExternalLink } from '@/utils/telegram';

afterEach(() => {
  delete window.Telegram;
  vi.restoreAllMocks();
});

describe('openExternalLink', () => {
  it('в мини-аппе зовёт Telegram.WebApp.openLink без instant view', () => {
    const openLink = vi.fn();
    window.Telegram = { WebApp: { openLink } };
    const open = vi.spyOn(window, 'open').mockImplementation(() => null);

    expect(openExternalLink('https://pay.monobank.ua/x')).toBe(true);
    expect(openLink).toHaveBeenCalledWith('https://pay.monobank.ua/x', { try_instant_view: false });
    expect(open).not.toHaveBeenCalled();
  });

  it('вне Telegram — новая вкладка', () => {
    const open = vi.spyOn(window, 'open').mockImplementation(() => null);

    expect(openExternalLink('https://pay.monobank.ua/x')).toBe(false);
    expect(open).toHaveBeenCalledWith('https://pay.monobank.ua/x', '_blank', 'noopener');
  });

  it('пустая ссылка ничего не открывает', () => {
    const open = vi.spyOn(window, 'open').mockImplementation(() => null);
    expect(openExternalLink('')).toBe(false);
    expect(open).not.toHaveBeenCalled();
  });
});
