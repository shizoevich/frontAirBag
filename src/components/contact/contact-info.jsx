'use client';

import React from "react";
import { useTranslations } from 'next-intl';
import Link from 'next/link';

const ContactInfo = ({ locale }) => {
  const t = useTranslations('Contact');
  
  return (
    <section className="tp-contact-area pb-60 pt-20">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-xl-10 col-lg-10">
            <div className="tp-contact-info-wrapper bg-white rounded-3 shadow-sm p-4 p-md-5">
              <div className="text-center mb-4">
                <h2 className="tp-section-title mb-3">{t('title')}</h2>
                <p className="tp-section-subtitle mb-4">{t('subtitle')}</p>
              </div>
              
              <div className="row">
                {/* Email Card */}
                <div className="col-lg-6 col-md-6 mb-4">
                  <div className="tp-contact-card d-flex align-items-center gap-3 p-4 rounded-3 shadow-sm border h-100">
                    <div className="tp-contact-icon bg-primary rounded-circle d-flex align-items-center justify-content-center" style={{width: 50, height: 50, flexShrink: 0}}>
                      <i className="far fa-envelope text-white fs-4"></i>
                    </div>
                    <div className="tp-contact-content">
                      <h5 className="mb-2 fs-6 fw-bold">{t('email')}</h5>
                      <a href="mailto:Noxnew@hotmail.com" className="text-primary text-decoration-none">
                        {t('emailAddress')}
                      </a>
                    </div>
                  </div>
                </div>
                
                {/* Phone Card */}
                <div className="col-lg-6 col-md-6 mb-4">
                  <div className="tp-contact-card d-flex align-items-center gap-3 p-4 rounded-3 shadow-sm border h-100">
                    <div className="tp-contact-icon bg-success rounded-circle d-flex align-items-center justify-content-center" style={{width: 50, height: 50, flexShrink: 0}}>
                      <i className="far fa-phone-alt text-white fs-4"></i>
                    </div>
                    <div className="tp-contact-content">
                      <h5 className="mb-2 fs-6 fw-bold">{t('phone')}</h5>
                      <a href="tel:+380989998928" className="text-success text-decoration-none">
                        {t('phoneNumber')}
                      </a>
                    </div>
                  </div>
                </div>
                
                {/* Delivery Card */}
                <div className="col-lg-6 col-md-6 mb-4">
                  <div className="tp-contact-card d-flex align-items-center gap-3 p-4 rounded-3 shadow-sm border h-100">
                    <div className="tp-contact-icon bg-info rounded-circle d-flex align-items-center justify-content-center" style={{width: 50, height: 50, flexShrink: 0}}>
                      <i className="fas fa-truck text-white fs-4"></i>
                    </div>
                    <div className="tp-contact-content">
                      <h5 className="mb-2 fs-6 fw-bold">{t('delivery')}</h5>
                      <p className="text-secondary mb-0 small">{t('deliveryInfo')}</p>
                    </div>
                  </div>
                </div>
                
                {/* Working Hours Card */}
                <div className="col-lg-6 col-md-6 mb-4">
                  <div className="tp-contact-card d-flex align-items-center gap-3 p-4 rounded-3 shadow-sm border h-100">
                    <div className="tp-contact-icon bg-purple rounded-circle d-flex align-items-center justify-content-center" style={{width: 50, height: 50, flexShrink: 0, backgroundColor: '#6f42c1'}}>
                      <i className="far fa-clock text-white fs-4"></i>
                    </div>
                    <div className="tp-contact-content">
                      <h5 className="mb-2 fs-6 fw-bold">{t('workingHours')}</h5>
                      <p className="text-secondary mb-0 small">
                        {t('workingDays')}<br />
                        {t('weekend')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="tp-contact-social mt-5 text-center">
                <h3 className="tp-section-title-sm mb-4">{t('socialNetworks')}</h3>
                <p className="mb-4 text-secondary mx-auto" style={{maxWidth: '600px'}}>
                  {t('socialDescription')}
                </p>
                <div className="d-flex justify-content-center gap-3 flex-wrap">
                  {/* Telegram */}
                  <a 
                    href="https://t.me/AirBagAD_bot" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    aria-label={t('socialLabels.telegram')}
                    className="tp-social-btn bg-primary rounded-circle d-flex align-items-center justify-content-center text-white fs-4"
                    style={{width: 60, height: 60, transition: 'all 0.3s ease'}}
                  >
                    <i className="fab fa-telegram"></i>
                  </a>
                  
                  {/* TikTok */}
                  <a 
                    href="https://tiktok.com/@airbag_ad" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    aria-label={t('socialLabels.tiktok')}
                    className="tp-social-btn bg-dark rounded-circle d-flex align-items-center justify-content-center text-white fs-4"
                    style={{width: 60, height: 60, transition: 'all 0.3s ease'}}
                  >
                    <i className="fab fa-tiktok"></i>
                  </a>
                  
                  {/* Instagram */}
                  <a 
                    href="https://instagram.com/airbag_ad" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    aria-label={t('socialLabels.instagram')}
                    className="tp-social-btn rounded-circle d-flex align-items-center justify-content-center text-white fs-4"
                    style={{width: 60, height: 60, background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)', transition: 'all 0.3s ease'}}
                  >
                    <i className="fab fa-instagram"></i>
                  </a>
                  
                  {/* Facebook */}
                  <a 
                    href="https://facebook.com/airbag.ad" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    aria-label={t('socialLabels.facebook')}
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
      </div>
    </section>
  );
};

export default ContactInfo;
