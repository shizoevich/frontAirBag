'use client';
import React from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';

// AIRBAG-86: страница «Кабінет» — навигация блоками (иконка + надпись),
// включая «Мій профіль». «Мій кабінет» во всех местах ведёт сюда.
const T = {
  uk: {
    title: 'Мій кабінет',
    subtitle: 'Оберіть розділ',
    items: [
      { href: '/orders', icon: '📦', label: 'Мої замовлення' },
      { href: '/cart', icon: '🛒', label: 'Кошик' },
      { href: '/discounts', icon: '％', label: 'Знижки' },
      { href: '/profile', icon: '👤', label: 'Мій профіль' },
      { href: '/returns', icon: '↩️', label: 'Повернення' },
      { href: '/contact', icon: '✉️', label: 'Контакти' },
    ],
  },
  ru: {
    title: 'Мой кабинет',
    subtitle: 'Выберите раздел',
    items: [
      { href: '/orders', icon: '📦', label: 'Мои заказы' },
      { href: '/cart', icon: '🛒', label: 'Корзина' },
      { href: '/discounts', icon: '％', label: 'Скидки' },
      { href: '/profile', icon: '👤', label: 'Мой профиль' },
      { href: '/returns', icon: '↩️', label: 'Возвраты' },
      { href: '/contact', icon: '✉️', label: 'Контакты' },
    ],
  },
};

const CabinetArea = () => {
  const locale = useLocale();
  const t = T[locale] || T.uk;

  return (
    <section className="py-5" style={{ background: '#f7f9fc', minHeight: '60vh' }}>
      <div className="container">
        <div className="text-center mb-4">
          <h1 className="mb-1">{t.title}</h1>
          <p className="text-muted">{t.subtitle}</p>
        </div>
        <div className="row g-3 g-md-4 justify-content-center">
          {t.items.map((it) => (
            <div key={it.href} className="col-6 col-md-4 col-lg-3">
              <Link
                href={`/${locale}${it.href}`}
                className="d-flex flex-column align-items-center justify-content-center text-decoration-none"
                style={{
                  background: '#fff',
                  border: '1px solid rgba(0,0,0,0.06)',
                  borderRadius: 18,
                  padding: '28px 16px',
                  height: '100%',
                  minHeight: 140,
                  color: '#0a1f33',
                  boxShadow: '0 6px 18px rgba(0,0,0,0.05)',
                  transition: 'transform .15s ease, box-shadow .15s ease',
                }}
              >
                <span style={{ fontSize: 40, lineHeight: 1, marginBottom: 12 }}>{it.icon}</span>
                <span style={{ fontWeight: 600, textAlign: 'center' }}>{it.label}</span>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CabinetArea;
