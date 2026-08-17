'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLocalizedLink } from '@/utils/localeLink';
import { phones, viberLink } from '@/data/contact-data';
import airbagMitsubishi from '@banner/cut/airbag-mitsubishi.png';
import airbagNissan from '@banner/cut/airbag-nissan.png';
import beltBmwM from '@banner/cut/belt-bmw-m.png';
import airbagAudi from '@banner/cut/airbag-audi.png';
import pyroLShaped from '@banner/cut/pyro-l-shaped.png';
import pyroModules from '@banner/cut/pyro-modules.png';
import beltBmwMNarrow from '@banner/cut/belt-bmw-m-narrow.png';
import airbagChevrolet from '@banner/cut/airbag-chevrolet.png';
import kneeHonda from '@banner/cut/knee-honda.png';
import s from './home-banner-carousel.module.css';

const AUTOPLAY_MS = 6000;
const PYRO_CATEGORY = '/category/piropatrony-754101';
const TELEGRAM_URL = 'https://t.me/AirBagAD_bot';
const PHONE = phones[0];

/**
 * Тексты слайдов. Живут здесь, а не в messages/*.json, по той же причине, что и
 * в прежней SEO-плашке: это маркетинговая копия одного блока, которую правят целиком
 * и на всех трёх языках сразу.
 */
const COPY = {
  uk: {
    label: 'Банери AirbagAD',
    prev: 'Попередній банер',
    next: 'Наступний банер',
    goTo: (n) => `Показати банер ${n}`,
    slide: (n, total) => `${n} з ${total}`,
    brand: {
      title: 'AirbagAD — подушки безпеки, ремені та піропатрони з доставкою по Україні',
      subtitle: 'Одеса, Київ, Харків, Дніпро, Львів та інші міста — відправлення в день замовлення.',
    },
    offer: {
      eyebrow: 'В наявності на складі в Одесі',
      title: 'Піропатрони, пульки та парашути — від 130 ₴',
      cta: 'У каталог витратників →',
      note: '160+ позицій · відправлення сьогодні',
    },
    help: {
      eyebrow: 'Не знаєте, що підійде?',
      title: 'Надішліть фото деталі — підберемо за 15 хвилин',
      telegram: 'Написати в Telegram →',
      viber: 'Viber',
    },
  },
  ru: {
    label: 'Баннеры AirbagAD',
    prev: 'Предыдущий баннер',
    next: 'Следующий баннер',
    goTo: (n) => `Показать баннер ${n}`,
    slide: (n, total) => `${n} из ${total}`,
    brand: {
      title: 'AirbagAD — подушки безопасности, ремни и пиропатроны с доставкой по Украине',
      subtitle: 'Одесса, Киев, Харьков, Днепр, Львов и другие города — отправка в день заказа.',
    },
    offer: {
      eyebrow: 'В наличии на складе в Одессе',
      title: 'Пиропатроны, пульки и парашюты — от 130 ₴',
      cta: 'В каталог расходников →',
      note: '160+ позиций · отправка сегодня',
    },
    help: {
      eyebrow: 'Не знаете, что подойдёт?',
      title: 'Пришлите фото детали — подберём за 15 минут',
      telegram: 'Написать в Telegram →',
      viber: 'Viber',
    },
  },
  en: {
    label: 'AirbagAD banners',
    prev: 'Previous banner',
    next: 'Next banner',
    goTo: (n) => `Show banner ${n}`,
    slide: (n, total) => `${n} of ${total}`,
    brand: {
      title: 'AirbagAD — airbags, seat belts and pyrotechnics delivered across Ukraine',
      subtitle: 'Odesa, Kyiv, Kharkiv, Dnipro, Lviv and other cities — same-day dispatch.',
    },
    offer: {
      eyebrow: 'In stock at the Odesa warehouse',
      title: 'Pyrotechnics, squibs and airbag bags — from ₴130',
      cta: 'Browse consumables →',
      note: '160+ items · ships today',
    },
    help: {
      eyebrow: 'Not sure which part fits?',
      title: 'Send a photo of the part — we will match it in 15 minutes',
      telegram: 'Message on Telegram →',
      viber: 'Viber',
    },
  },
};

/**
 * Фотографии слайдов. Координаты — от края полосы, ровно как в макете; на узких
 * экранах они умножаются на --s, а помеченные `edge` детали прячутся первыми.
 */
const PHOTOS = {
  brand: [
    { img: airbagMitsubishi, x: '62px', y: '8px', w: '240px', rot: '-11deg', from: 'left', at: 'top', edge: true },
    { img: airbagNissan, x: '252px', y: '52px', w: '195px', rot: '8deg', from: 'left', at: 'top' },
    { img: beltBmwM, x: '202px', y: '44px', w: '290px', rot: '-6deg', from: 'right', at: 'top' },
    { img: airbagAudi, x: '72px', y: '20px', w: '210px', rot: '9deg', from: 'right', at: 'top', edge: true },
  ],
  offer: [
    { img: pyroLShaped, x: '470px', y: '-18px', w: '300px', rot: '-13deg', from: 'right', at: 'top', edge: 'wide' },
    { img: pyroModules, x: '235px', y: '26px', w: '265px', rot: '9deg', from: 'right', at: 'top' },
    { img: beltBmwMNarrow, x: '40px', y: '-28px', w: '285px', rot: '-7deg', from: 'right', at: 'bottom' },
  ],
  help: [
    { img: airbagChevrolet, x: '330px', y: '16px', w: '250px', rot: '-9deg', from: 'right', at: 'top', edge: 'wide' },
    { img: kneeHonda, x: '90px', y: '-24px', w: '280px', rot: '7deg', from: 'right', at: 'bottom' },
  ],
};

function Photos({ items, onDark = false, priority = false }) {
  return items.map((p, i) => (
    <span
      key={i}
      aria-hidden="true"
      className={[
        s.photo,
        p.from === 'left' ? s.fromLeft : s.fromRight,
        p.at === 'top' ? s.fromTop : s.fromBottom,
        p.edge === 'wide' ? s.photoEdgeWide : '',
        p.edge === true ? s.photoEdge : '',
        onDark ? s.photoOnDark : '',
      ].filter(Boolean).join(' ')}
      style={{ '--x': p.x, '--y': p.y, '--w': p.w, '--rot': p.rot }}
    >
      {/* Декор: alt пустой — смысл слайда несёт текст, а не фотография детали. */}
      <Image src={p.img} alt="" sizes="320px" priority={priority} />
    </span>
  ));
}

const ArrowIcon = ({ dir }) => (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
    <path
      d={dir === 'prev' ? 'M10 2 4 8l6 6' : 'M6 2l6 6-6 6'}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * Карусель из трёх баннеров на главной. Меняется весь баннер целиком: у каждого
 * слайда свой фон, свои детали и свой текст.
 */
const HomeBannerCarousel = ({ locale = 'ru' }) => {
  const t = COPY[locale] || COPY.ru;
  const getLocalizedLink = useLocalizedLink();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const total = 3;
  const bandRef = useRef(null);

  const go = useCallback((next) => setIndex(((next % total) + total) % total), [total]);

  useEffect(() => {
    if (paused) return undefined;
    // Автопрокрутку не запускаем, если пользователь просил меньше движения.
    const reduced = typeof window !== 'undefined'
      && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return undefined;

    const id = setInterval(() => setIndex((i) => (i + 1) % total), AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [paused, total]);

  const onKeyDown = (e) => {
    if (e.key === 'ArrowLeft') { go(index - 1); }
    else if (e.key === 'ArrowRight') { go(index + 1); }
    else return;
    e.preventDefault();
  };

  // На неактивных слайдах ссылки и кнопки не должны ловить фокус табом.
  const tab = (slideIndex) => (slideIndex === index ? 0 : -1);
  const slideProps = (i) => ({
    className: s.slide,
    role: 'group',
    'aria-roledescription': locale === 'en' ? 'slide' : 'слайд',
    'aria-label': t.slide(i + 1, total),
    'aria-hidden': i === index ? undefined : true,
  });

  return (
    <section
      ref={bandRef}
      className={`${s.band} mb-50`}
      aria-roledescription="carousel"
      aria-label={t.label}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onKeyDown={onKeyDown}
    >
      <div className={s.viewport}>
        <div className={s.track} style={{ transform: `translateX(-${index * 100}%)` }}>
          {/* 1. Фирменный */}
          <div {...slideProps(0)} className={`${s.slide} ${s.slideBrand}`}>
            <span aria-hidden="true" className={`${s.ring} ${s.ring1}`} />
            <span aria-hidden="true" className={`${s.ring} ${s.ring2}`} />
            <Photos items={PHOTOS.brand} priority />
            <div className={`container ${s.content} ${s.contentCenter}`}>
              <div className={s.textCol}>
                {/* Единственный h1 страницы — заголовок остаётся тем же, что был
                    в прежней SEO-плашке, чтобы не потерять позиции по запросам. */}
                <h1 className={s.title}>{t.brand.title}</h1>
                <p className={s.subtitle}>{t.brand.subtitle}</p>
              </div>
            </div>
          </div>

          {/* 2. Оффер по расходникам */}
          <div {...slideProps(1)}>
            <span aria-hidden="true" className={s.wedgeOrange} />
            <span aria-hidden="true" className={s.glow} />
            <Photos items={PHOTOS.offer} />
            <div className={`container ${s.content}`}>
              <div className={s.textCol}>
                <span className={s.eyebrow}>{t.offer.eyebrow}</span>
                <h2 className={`${s.title} ${s.titleOffer}`}>{t.offer.title}</h2>
                <div className={s.actions}>
                  <Link
                    href={getLocalizedLink(PYRO_CATEGORY, 'banner-offer')}
                    className={s.btn}
                    tabIndex={tab(1)}
                  >
                    {t.offer.cta}
                  </Link>
                  <span className={s.note}>{t.offer.note}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Подбор детали по фото */}
          <div {...slideProps(2)}>
            <span aria-hidden="true" className={s.wedgeDark} />
            <Photos items={PHOTOS.help} onDark />
            <div className={`container ${s.content}`}>
              <div className={s.textCol}>
                <span className={`${s.eyebrow} ${s.eyebrowLight}`}>{t.help.eyebrow}</span>
                <h2 className={`${s.title} ${s.titleOffer} ${s.titleLight}`}>{t.help.title}</h2>
                <div className={s.actions}>
                  <a
                    href={TELEGRAM_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={s.btn}
                    tabIndex={tab(2)}
                  >
                    {t.help.telegram}
                  </a>
                  <a
                    href={viberLink}
                    className={`${s.btn} ${s.btnGhostLight}`}
                    tabIndex={tab(2)}
                  >
                    {t.help.viber}
                  </a>
                  <a href={`tel:${PHONE.tel}`} className={s.phone} tabIndex={tab(2)}>
                    {PHONE.display}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <button
        type="button"
        className={`${s.arrow} ${s.arrowPrev}`}
        aria-label={t.prev}
        onClick={() => go(index - 1)}
      >
        <ArrowIcon dir="prev" />
      </button>
      <button
        type="button"
        className={`${s.arrow} ${s.arrowNext}`}
        aria-label={t.next}
        onClick={() => go(index + 1)}
      >
        <ArrowIcon dir="next" />
      </button>

      <div className={s.indicators}>
        <div className="container">
          <div className={`${s.indicatorsRow} ${index === 2 ? s.indicatorsOnDark : ''}`}>
            {[0, 1, 2].map((i) => (
              <button
                key={i}
                type="button"
                className={`${s.dot} ${i === index ? s.dotActive : ''}`}
                aria-label={t.goTo(i + 1)}
                aria-current={i === index ? 'true' : undefined}
                onClick={() => go(i)}
              />
            ))}
            <span className={s.counter}>{`${index + 1} / ${total}`}</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeBannerCarousel;
