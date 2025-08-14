'use client';

import React from "react";
import { useTranslations } from 'next-intl';
import Link from 'next/link';

const ContactInfo = ({ locale }) => {
  const t = useTranslations('Contact');
  
  return (
    <section className="tp-contact-area pb-100 pt-20" style={{background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'}}>
          <div className="row justify-content-center">
            <div className="col-xl-10 col-lg-10">
              <div className="tp-contact-info-wrapper" style={{
                boxShadow: '0 15px 35px rgba(0,0,0,0.1)', 
                borderRadius: 20, 
                background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)', 
                padding: '48px 32px',
                border: '1px solid rgba(222, 128, 67, 0.1)'
              }}>
                <div style={{textAlign: 'center', marginBottom: 40}}>
                  <h1 className="tp-contact-title" style={{
                    fontSize: '2.5rem', 
                    fontWeight: 700, 
                    color: '#2d2d2d',
                    marginBottom: 12,
                    marginTop: 0,
                    lineHeight: 1.2
                  }}>
                    {t('title')}
                  </h1>
                  <p style={{
                    fontSize: '1.2rem',
                    color: '#6c757d',
                    marginBottom: 24,
                    maxWidth: '700px',
                    marginLeft: 'auto',
                    marginRight: 'auto'
                  }}>
                    {t('subtitle')}
                  </p>
                  <div style={{
                    width: 60,
                    height: 4,
                    background: 'linear-gradient(90deg, #de8043 0%, #ff9a56 100%)',
                    margin: '0 auto',
                    borderRadius: 2
                  }}></div>
                </div>
                
                <div className="row">
                  {/* Email Card */}
                  <div className="col-lg-6 col-md-6 mb-4">
                    <div className="tp-contact-info-item" style={{
                      fontSize: '1.1rem', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 16,
                      padding: 24,
                      background: '#fff',
                      borderRadius: 12,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                      border: '1px solid #f1f3f4',
                      transition: 'all 0.3s ease',
                      height: '100%',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0 8px 20px rgba(0,0,0,0.1)'
                      }
                    }}>
                      <div style={{
                        width: 60,
                        height: 60,
                        background: 'linear-gradient(135deg, #de8043 0%, #ff9a56 100%)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <i className="fa-regular fa-envelope" style={{fontSize: 24, color: '#fff'}}></i>
                      </div>
                      <div className="tp-contact-info-content">
                        <div style={{fontWeight: 700, color: '#2d2d2d', marginBottom: 8, fontSize: '1.1rem'}}>
                          {t('email')}
                        </div>
                        <a 
                          href={`mailto:${t('emailAddress')}`} 
                          style={{
                            color: '#de8043', 
                            textDecoration: 'none',
                            wordBreak: 'break-word',
                            '&:hover': {
                              textDecoration: 'underline'
                            }
                          }}
                        >
                          {t('emailAddress')}
                        </a>
                      </div>
                    </div>
                  </div>
                  
                  {/* Phone Card */}
                  <div className="col-lg-6 col-md-6 mb-4">
                    <div className="tp-contact-info-item" style={{
                      fontSize: '1.1rem', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 16,
                      padding: 24,
                      background: '#fff',
                      borderRadius: 12,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                      border: '1px solid #f1f3f4',
                      transition: 'all 0.3s ease',
                      height: '100%',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0 8px 20px rgba(0,0,0,0.1)'
                      }
                    }}>
                      <div style={{
                        width: 60,
                        height: 60,
                        background: 'linear-gradient(135deg, #28a745 0%, #34ce57 100%)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <i className="fa-solid fa-phone" style={{fontSize: 24, color: '#fff'}}></i>
                      </div>
                      <div className="tp-contact-info-content">
                        <div style={{fontWeight: 700, color: '#2d2d2d', marginBottom: 8, fontSize: '1.1rem'}}>
                          {t('phone')}
                        </div>
                        <a 
                          href={`tel:${t('phoneNumber').replace(/\s+/g, '')}`} 
                          style={{
                            color: '#28a745', 
                            textDecoration: 'none',
                            '&:hover': {
                              textDecoration: 'underline'
                            }
                          }}
                        >
                          {t('phoneNumber')}
                        </a>
                      </div>
                    </div>
                  </div>
                  
                  {/* Delivery Card */}
                  <div className="col-lg-6 col-md-6 mb-4">
                    <div className="tp-contact-info-item" style={{
                      fontSize: '1.1rem', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 16,
                      padding: 24,
                      background: '#fff',
                      borderRadius: 12,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                      border: '1px solid #f1f3f4',
                      transition: 'all 0.3s ease',
                      height: '100%',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0 8px 20px rgba(0,0,0,0.1)'
                      }
                    }}>
                      <div style={{
                        width: 60,
                        height: 60,
                        background: 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <i className="fa-solid fa-truck" style={{fontSize: 24, color: '#fff'}}></i>
                      </div>
                      <div className="tp-contact-info-content">
                        <div style={{fontWeight: 700, color: '#2d2d2d', marginBottom: 8, fontSize: '1.1rem'}}>
                          {t('delivery')}
                        </div>
                        <div style={{color: '#6c757d', lineHeight: 1.5}}>
                          {t('deliveryInfo')}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Working Hours Card */}
                  <div className="col-lg-6 col-md-6 mb-4">
                    <div className="tp-contact-info-item" style={{
                      fontSize: '1.1rem', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 16,
                      padding: 24,
                      background: '#fff',
                      borderRadius: 12,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                      border: '1px solid #f1f3f4',
                      transition: 'all 0.3s ease',
                      height: '100%',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0 8px 20px rgba(0,0,0,0.1)'
                      }
                    }}>
                      <div style={{
                        width: 60,
                        height: 60,
                        background: 'linear-gradient(135deg, #6f42c1 0%, #8a63d2 100%)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <i className="fa-regular fa-clock" style={{fontSize: 24, color: '#fff'}}></i>
                      </div>
                      <div className="tp-contact-info-content">
                        <div style={{fontWeight: 700, color: '#2d2d2d', marginBottom: 8, fontSize: '1.1rem'}}>
                          {t('workingHours')}
                        </div>
                        <div style={{color: '#6c757d', lineHeight: 1.5}}>
                          <div>{t('workingDays')}</div>
                          <div>{t('weekend')}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="tp-contact-info-item mt-5" style={{textAlign: 'center', marginTop: '60px !important'}}>
                  <h3 className="tp-contact-social-title mb-4" style={{
                    fontSize: '2rem', 
                    fontWeight: 700, 
                    color: '#2d2d2d',
                    marginBottom: '24px',
                    position: 'relative',
                    display: 'inline-block',
                    '&:after': {
                      content: '""',
                      position: 'absolute',
                      bottom: '-12px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '60px',
                      height: '3px',
                      background: 'linear-gradient(90deg, #de8043 0%, #ff9a56 100%)',
                      borderRadius: '2px'
                    }
                  }}>
                    {t('socialNetworks')}
                  </h3>
                  <p className="mb-4" style={{
                    color: '#6c757d',
                    fontSize: '1.1rem',
                    maxWidth: '600px',
                    margin: '0 auto 30px',
                    lineHeight: 1.6
                  }}>
                    {t('socialDescription')}
                  </p>
                  <div className="tp-contact-social-icon" style={{
                    gap: '20px', 
                    display: 'flex', 
                    justifyContent: 'center',
                    flexWrap: 'wrap',
                    margin: '0 auto',
                    maxWidth: '500px'
                  }}>
                    {/* Telegram */}
                    <a 
                      href="https://t.me/AirBagAD_bot" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      aria-label={t('socialLabels.telegram')}
                      style={{
                        width: '70px',
                        height: '70px',
                        background: 'linear-gradient(135deg, #0088cc 0%, #229ed9 100%)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontSize: '28px',
                        textDecoration: 'none',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 4px 12px rgba(0,136,204,0.3)',
                        '&:hover': {
                          transform: 'translateY(-5px)',
                          boxShadow: '0 8px 20px rgba(0,136,204,0.4)'
                        }
                      }}
                    >
                      <i className="fa-brands fa-telegram"></i>
                    </a>
                    
                    {/* TikTok */}
                    <a 
                      href="https://tiktok.com/@airbag_ad" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      aria-label={t('socialLabels.tiktok')}
                      style={{
                        width: '70px',
                        height: '70px',
                        background: 'linear-gradient(135deg, #000 0%, #333 100%)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontSize: '28px',
                        textDecoration: 'none',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                        '&:hover': {
                          transform: 'translateY(-5px)',
                          boxShadow: '0 8px 20px rgba(0,0,0,0.4)'
                        }
                      }}
                    >
                      <i className="fa-brands fa-tiktok"></i>
                    </a>
                    
                    {/* Instagram */}
                    <a 
                      href="https://instagram.com/airbag_ad" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      aria-label={t('socialLabels.instagram')}
                      style={{
                        width: '70px',
                        height: '70px',
                        background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontSize: '28px',
                        textDecoration: 'none',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 4px 12px rgba(220, 39, 67, 0.3)',
                        '&:hover': {
                          transform: 'translateY(-5px)',
                          boxShadow: '0 8px 20px rgba(220, 39, 67, 0.4)'
                        }
                      }}
                    >
                      <i className="fa-brands fa-instagram"></i>
                    </a>
                    
                    {/* Facebook */}
                    <a 
                      href="https://facebook.com/airbag.ad" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      aria-label={t('socialLabels.facebook')}
                      style={{
                        width: '70px',
                        height: '70px',
                        background: 'linear-gradient(135deg, #1877f2 0%, #42a5f5 100%)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontSize: '28px',
                        textDecoration: 'none',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 4px 12px rgba(24,119,242,0.3)',
                        '&:hover': {
                          transform: 'translateY(-5px)',
                          boxShadow: '0 8px 20px rgba(24,119,242,0.4)'
                        }
                      }}
                    >
                      <i className="fa-brands fa-facebook-f"></i>
                    </a>
                  </div>
                </div>
                
                {/* Contact Form Removed as per requirements */}
                
              </div>
            </div>
          </div>
       
    </section>
  );
};

export default ContactInfo;
