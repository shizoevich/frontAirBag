'use client';
import React from 'react';
import { feature_data } from './feature-data';
import { useTranslations } from 'next-intl';

const FeatureArea = () => {
  const t = useTranslations('features');
  
  return (
    <section className="tp-feature-area tp-feature-border-radius pb-70">
        <div className="container">
          <div className="row gx-1 gy-1 gy-xl-0">
            {feature_data.map((item,i) => (
              <div key={i} className="col-xl-3 col-lg-6 col-md-6 col-sm-6">
                <div className="tp-feature-item d-flex align-items-start">
                    <div className="tp-feature-icon mr-15">
                      <span>
                          {item.icon}                                                     
                      </span>
                    </div>
                    <div className="tp-feature-content">
                      <h3 className="tp-feature-title">{item.titleKey ? t(item.titleKey.replace('features.', '')) : item.title}</h3>
                      <p>{item.subtitleKey ? t(item.subtitleKey.replace('features.', '')) : item.subtitle}</p>
                    </div>
                </div>
              </div>
            ))}
          </div>
        </div>
    </section>
  );
};

export default FeatureArea;