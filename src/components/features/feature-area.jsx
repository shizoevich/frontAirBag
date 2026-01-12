import React from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
// internal
import { AnimatedLine } from '@/svg';
import shape_1 from '@assets/img/subscribe/subscribe-shape-1.png';
import shape_2 from '@assets/img/subscribe/subscribe-shape-2.png';
import shape_3 from '@assets/img/subscribe/subscribe-shape-3.png';
import shape_4 from '@assets/img/subscribe/subscribe-shape-4.png';
import plane from '@assets/img/subscribe/plane.png';

function Shape({ img, num }) {
  return (
    <Image className={`tp-subscribe-shape-${num}`} src={img} alt="shape" />
  );
}

const FeatureArea = () => {
  const t = useTranslations('Contact');
  
  return (
    <section className="tp-subscribe-area pt-70 pb-65 mb-50 theme-bg p-relative z-index-1">
      <div className="tp-subscribe-shape">
        <Shape img={shape_1} num="1" />
        
        
        
        
      </div>
      <div className="container">
        <div className="row align-items-center justify-content-center">
          <div className="col-xl-8 col-lg-8 text-center">
            <div className="tp-subscribe-content">
              
              
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeatureArea;