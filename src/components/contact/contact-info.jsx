import React from "react";
import { useTranslations } from 'next-intl';

const ContactInfo = () => {
  const t = useTranslations('Contact');
  return (
    <section className="tp-contact-area pb-100">
      <div className="container">
        <div className="tp-contact-inner">
          <div className="row justify-content-center">
            <div className="col-xl-6 col-lg-7">
              <div className="tp-contact-info-wrapper" style={{boxShadow: '0 0 24px #e7e7e7', borderRadius: 16, background: '#fff', padding: 36}}>
                <h2 className="tp-contact-title mb-4" style={{textAlign: 'center', fontSize: '2rem', fontWeight: 700}}>{t('title')}</h2>
                <div className="tp-contact-info-item mb-4" style={{fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: 12}}>
                  <i className="fa-regular fa-envelope" style={{fontSize: 28, color: '#2d2d2d'}}></i>
                  <div className="tp-contact-info-content">
                    <strong style={{marginRight: 8}}>{t('email')}</strong>
                    <a href={`mailto:${t('emailAddress')}`}>{t('emailAddress')}</a>
                  </div>
                </div>
                <div className="tp-contact-info-item mb-4" style={{fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: 12}}>
                  <i className="fa-solid fa-phone" style={{fontSize: 28, color: '#2d2d2d'}}></i>
                  <div className="tp-contact-info-content">
                    <strong style={{marginRight: 8}}>{t('phone')}</strong>
                    <a href={`tel:${t('phoneNumber')}`}>{t('phoneNumber')}</a>
                  </div>
                </div>
                <div className="tp-contact-info-item mb-4" style={{fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: 12}}>
                  <i className="fa-solid fa-truck" style={{fontSize: 28, color: '#2d2d2d'}}></i>
                  <div className="tp-contact-info-content">
                    <strong style={{marginRight: 8}}>{t('delivery')}</strong>
                    <span>{t('deliveryInfo')}</span>
                  </div>
                </div>
                <div className="tp-contact-info-item mb-4" style={{fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: 12}}>
                  <i className="fa-regular fa-clock" style={{fontSize: 28, color: '#2d2d2d'}}></i>
                  <div className="tp-contact-info-content">
                    <strong style={{marginRight: 8}}>{t('workingHours')}</strong>
                    <span>{t('workingDays')}</span>, <span>{t('weekend')}</span>
                  </div>
                </div>
                <div className="tp-contact-info-item mt-5" style={{fontSize: '1.25rem', textAlign: 'center'}}>
                  <h4 className="tp-contact-social-title mb-3" style={{fontSize: '1.5rem', fontWeight: 700}}>{t('socialNetworks')}</h4>
                  <div className="tp-contact-social-icon" style={{gap: 20, display: 'flex', justifyContent: 'center'}}>
                    <a href="https://t.me/AirBagAD_bot" target="_blank" rel="noopener noreferrer" aria-label="Telegram" style={{fontSize: 28}}>
                      <i className="fa-brands fa-telegram"></i>
                    </a>
                    <a href="https://tiktok.com/@airbag_ad" target="_blank" rel="noopener noreferrer" aria-label="TikTok" style={{fontSize: 28}}>
                      <i className="fa-brands fa-tiktok"></i>
                    </a>
                    <a href="https://instagram.com/dmytro_gekalo" target="_blank" rel="noopener noreferrer" aria-label="Instagram" style={{fontSize: 28}}>
                      <i className="fa-brands fa-instagram"></i>
                    </a>
                    <a href="https://facebook.com/dmytro.gekalo" target="_blank" rel="noopener noreferrer" aria-label="Facebook" style={{fontSize: 28}}>
                      <i className="fa-brands fa-facebook-f"></i>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactInfo;
