'use client';
import React from 'react';
import { feature_data } from './feature-data';
import { useTranslations } from 'next-intl';

const FeatureArea = () => {
  const t = useTranslations('features');
  
  // Стили для выравнивания высоты блоков
  const containerStyle = {
    display: 'flex',
    flexWrap: 'wrap'
  };
  
  const colStyle = {
    display: 'flex'
  };
  
  const featureItemStyle = {
    display: 'flex',
    alignItems: 'center',
    height: '100%',
    minHeight: '120px',
    padding: '30px 0px 0px 20px',
    background: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s ease',
    width: '100%'
  };
  
  const featureContentStyle = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start'
  };
  
  const titleStyle = {
    marginBottom: '8px',
    fontSize: '16px',
    lineHeight: '1.3',
    minHeight: '20px'
  };
  
  const descStyle = {
    margin: 0,
    fontSize: '14px',
    lineHeight: '1.4',
    color: '#666',
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  };
  
  return (
    <section className="tp-feature-area tp-feature-border-radius pt-30 pb-70">
        <div className="container">
          <div className="row gx-1 gy-1 gy-xl-0" style={containerStyle}>
            {feature_data.map((item,i) => (
              <div key={i} className="col-xl-3 col-lg-6 col-md-6 col-sm-6" style={colStyle}>
                <div className="tp-feature-item d-flex align-items-start" style={featureItemStyle}>
                    <div className="tp-feature-icon mr-15">
                      <span>
                          {item.icon}                                                     
                      </span>
                    </div>
                    <div className="tp-feature-content" style={featureContentStyle}>
                      <h3 className="tp-feature-title" style={titleStyle}>
                        {item.titleKey ? t(item.titleKey.replace('features.', '')) : item.title}
                      </h3>
                      <p style={descStyle}>
                        {item.subtitleKey ? t(item.subtitleKey.replace('features.', '')) : item.subtitle}
                      </p>
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