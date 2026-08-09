import React from 'react';
import Image from 'next/image';
// internal
import shape_1 from '@assets/img/subscribe/subscribe-shape-1.png';

function Shape({ img, num }) {
  // Decorative image — hidden from assistive tech & ignored for SEO.
  return (
    <Image className={`tp-subscribe-shape-${num}`} src={img} alt="" aria-hidden="true" />
  );
}

// SEO-meaningful hero copy (keyword-rich H1/H2) per locale.
const HERO = {
  uk: {
    h1: 'AirbagAD — подушки безпеки, ремені та піропатрони з доставкою по Україні',
    h2: 'Продаж і доставка подушок безпеки, ременів безпеки, піропатронів, пульок і парашутів по всій Україні — Одеса, Київ, Харків, Дніпро, Львів та інші міста.',
  },
  ru: {
    h1: 'AirbagAD — подушки безопасности, ремни и пиропатроны с доставкой по Украине',
    h2: 'Продажа и доставка подушек безопасности, ремней безопасности, пиропатронов, пулек и парашютов по всей Украине — Одесса, Киев, Харьков, Днепр, Львов и другие города.',
  },
  en: {
    h1: 'AirbagAD — airbags, seat belts and pyrotechnics delivered across Ukraine',
    h2: 'Sale and delivery of airbags, seat belts, pyrotechnics (squibs) and airbag bags across all Ukraine — Odesa, Kyiv, Kharkiv, Dnipro, Lviv and other cities.',
  },
};

const FeatureArea = ({ locale = 'ru' }) => {
  const hero = HERO[locale] || HERO.ru;

  return (
    <section className="tp-subscribe-area tp-hero-seo mb-50 theme-bg p-relative z-index-1">
      <div className="tp-subscribe-shape">
        <Shape img={shape_1} num="1" />
      </div>
      <div className="container">
        <div className="row align-items-center justify-content-center">
          <div className="col-xl-8 col-lg-8 text-center">
            <div className="tp-subscribe-content">
              <h1 className="tp-section-title">{hero.h1}</h1>
              <p className="tp-section-subtitle">{hero.h2}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeatureArea;
