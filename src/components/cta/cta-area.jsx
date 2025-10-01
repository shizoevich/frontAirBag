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

const CtaArea = () => {
  const t = useTranslations('Contact');
  
  return (
    <section className="tp-subscribe-area pt-70 pb-65 theme-bg p-relative z-index-1">
      <div className="tp-subscribe-shape">
        <Shape img={shape_1} num="1" />
        <Shape img={shape_2} num="2" />
        <Shape img={shape_3} num="3" />
        <Shape img={shape_4} num="4" />
        <div className="tp-subscribe-plane">
          <Image className="tp-subscribe-plane-shape" src={plane} alt="img" />
          <AnimatedLine />
        </div>
      </div>
      <div className="container">
        <div className="row align-items-center justify-content-center">
          <div className="col-xl-8 col-lg-8 text-center">
            <div className="tp-subscribe-content">
              <h3 className="tp-subscribe-title text-white mb-4">Слідкуйте за нашими новинами</h3>
              
              <div className="d-flex justify-content-center gap-3 flex-wrap mt-4">
                {/* Telegram */}
                <a 
                  href="https://t.me/AirBagAD_bot" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  aria-label="Telegram"
                  className="tp-social-btn bg-primary rounded-circle d-flex align-items-center justify-content-center text-white fs-4"
                  style={{width: 60, height: 60, transition: 'all 0.3s ease'}}
                >
                  <i className="fab fa-telegram"></i>
                </a>
                
                {/* TikTok */}
                <a 
                  href="https://www.tiktok.com/@dmytro_gekalo?_t=ZM-8yjBBkpbNbi&_r=1" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  aria-label="TikTok"
                  className="tp-social-btn bg-dark rounded-circle d-flex align-items-center justify-content-center text-white fs-4"
                  style={{width: 60, height: 60, transition: 'all 0.3s ease'}}
                >
                  <i className="fab fa-tiktok"></i>
                </a>
                
                {/* Instagram */}
                <a 
                  href="https://www.instagram.com/dmytro_gekalo?igsh=MXV2MmNsaWpkdHlkeA%3D%3D&utm_source=qr" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  aria-label="Instagram"
                  className="tp-social-btn rounded-circle d-flex align-items-center justify-content-center text-white fs-4"
                  style={{width: 60, height: 60, background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)', transition: 'all 0.3s ease'}}
                >
                  <i className="fab fa-instagram"></i>
                </a>
                
                {/* Facebook */}
                <a 
                  href="https://www.facebook.com/share/15rmtkFcaX/?mibextid=wwXIfr" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  aria-label="Facebook"
                  className="tp-social-btn bg-primary rounded-circle d-flex align-items-center justify-content-center text-white fs-4"
                  style={{width: 60, height: 60, transition: 'all 0.3s ease'}}
                >
                  <i className="fab fa-facebook-f"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CtaArea;