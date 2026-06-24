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
    h1: 'AirbagAD — подушки безпеки, ремені та піропатрони у Дніпрі',
    h2: 'Продаж і доставка подушок безпеки, ременів безпеки, піропатронів, пульок і парашутів по Дніпру та всій Україні.',
  },
  ru: {
    h1: 'AirbagAD — подушки безопасности, ремни и пиропатроны в Днепре',
    h2: 'Продажа и доставка подушек безопасности, ремней безопасности, пиропатронов, пулек и парашютов по Днепру и всей Украине.',
  },
  en: {
    h1: 'AirbagAD — airbags, seat belts and pyrotechnics in Dnipro',
    h2: 'Sale and delivery of airbags, seat belts, pyrotechnics (squibs) and airbag bags across Dnipro and Ukraine.',
  },
};

const FeatureArea = ({ locale = 'ru' }) => {
  const hero = HERO[locale] || HERO.ru;

  return (
    <section className="tp-subscribe-area pt-70 pb-65 mb-50 theme-bg p-relative z-index-1">
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
