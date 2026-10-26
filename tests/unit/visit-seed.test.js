/**
 * Seed витрины: один на загрузку страницы, новый после перезагрузки.
 */
import { afterEach, describe, expect, it } from 'vitest';

import { getVisitSeed, resetVisitSeed } from '@/utils/visit-seed';

afterEach(() => resetVisitSeed());

describe('getVisitSeed', () => {
  it('в одной загрузке seed не меняется', () => {
    const first = getVisitSeed();
    expect(first).toBeTruthy();
    expect(getVisitSeed()).toBe(first);
  });

  it('новая загрузка даёт другой seed', () => {
    const first = getVisitSeed();
    resetVisitSeed();
    expect(getVisitSeed()).not.toBe(first);
  });

  it('влезает в лимит бэкенда и не требует экранирования', () => {
    const seed = getVisitSeed();
    expect(seed.length).toBeLessThanOrEqual(64);
    expect(seed).toMatch(/^[a-z0-9]+$/);
  });
});
