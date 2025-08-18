'use client';

import React from "react";
import { useTranslations } from 'next-intl';

const PrivacyPolicyArea = () => {
  const t = useTranslations('PrivacyPolicy');
  
  return (
    <section className="tp-privacy-policy-area pt-40 pb-60">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-xl-10 col-lg-10">
            <div className="tp-privacy-policy-wrapper bg-white rounded-3 shadow-sm p-4 p-md-5">
              <div className="text-center mb-4">
                <h2 className="tp-section-title mb-3">{t('title')}</h2>
                <p className="tp-section-subtitle mb-4">{t('subtitle')}</p>
              </div>
              
              <div className="tp-privacy-policy-content">
                <div className="mb-4">
                  <h4 className="mb-3">{t('section1.title')}</h4>
                  <p>{t('section1.description')}</p>
                  <ul className="list-unstyled ps-3 mt-3">
                    <li className="mb-2"><i className="fas fa-check-circle text-primary me-2"></i> {t('section1.items.item1')}</li>
                    <li className="mb-2"><i className="fas fa-check-circle text-primary me-2"></i> {t('section1.items.item2')}</li>
                    <li className="mb-2"><i className="fas fa-check-circle text-primary me-2"></i> {t('section1.items.item3')}</li>
                    <li className="mb-2"><i className="fas fa-check-circle text-primary me-2"></i> {t('section1.items.item4')}</li>
                    <li className="mb-2"><i className="fas fa-check-circle text-primary me-2"></i> {t('section1.items.item5')}</li>
                    <li className="mb-2"><i className="fas fa-check-circle text-primary me-2"></i> {t('section1.items.item6')}</li>
                    <li className="mb-2"><i className="fas fa-check-circle text-primary me-2"></i> {t('section1.items.item7')}</li>
                  </ul>
                </div>
                
                <div className="mb-4">
                  <h4 className="mb-3">{t('section2.title')}</h4>
                  <p>{t('section2.description')}</p>
                  <ul className="list-unstyled ps-3 mt-3">
                    <li className="mb-2"><i className="fas fa-check-circle text-primary me-2"></i> {t('section2.items.item1')}</li>
                    <li className="mb-2"><i className="fas fa-check-circle text-primary me-2"></i> {t('section2.items.item2')}</li>
                    <li className="mb-2"><i className="fas fa-check-circle text-primary me-2"></i> {t('section2.items.item3')}</li>
                    <li className="mb-2"><i className="fas fa-check-circle text-primary me-2"></i> {t('section2.items.item4')}</li>
                    <li className="mb-2"><i className="fas fa-check-circle text-primary me-2"></i> {t('section2.items.item5')}</li>
                  </ul>
                </div>
                
                <div className="mb-4">
                  <h4 className="mb-3">{t('section3.title')}</h4>
                  <p>{t('section3.description1')}</p>
                  <p>{t('section3.description2')}</p>
                </div>
                
                <div className="mb-4">
                  <h4 className="mb-3">{t('section4.title')}</h4>
                  <p>{t('section4.description1')}</p>
                  <p>{t('section4.description2')}</p>
                </div>
                
                <div className="mb-4">
                  <h4 className="mb-3">{t('section5.title')}</h4>
                  <p>{t('section5.description')}</p>
                </div>
                
                <div className="mb-4">
                  <h4 className="mb-3">{t('section6.title')}</h4>
                  <p>{t('section6.description')}</p>
                </div>
                
                <div className="mb-4">
                  <h4 className="mb-3">{t('section7.title')}</h4>
                  <p>{t('section7.description')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PrivacyPolicyArea;
