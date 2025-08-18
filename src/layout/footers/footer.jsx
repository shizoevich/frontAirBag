'use client';
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
// internal
import logo from '@assets/img/logo/auto-delivery-logo-nobg.png';
import pay from '@assets/img/footer/footer-pay.png';
import social_data from '@/data/social-data';
import { Email, Location } from '@/svg';

const Footer = ({ style_2 = false, style_3 = false,primary_style=false }) => {
  const t = useTranslations('Footer');
  return (
    <footer>
      <div className={`tp-footer-area ${primary_style?'tp-footer-style-2 tp-footer-style-primary tp-footer-style-6':''} ${style_2 ?'tp-footer-style-2':style_3 ? 'tp-footer-style-2 tp-footer-style-3': ''}`}
        data-bg-color={`${style_2 ? 'footer-bg-white' : 'footer-bg-grey'}`}>
        <div className="tp-footer-top pt-95 pb-40">
          <div className="container">
            <div className="row">
              <div className="col-xl-4 col-lg-3 col-md-4 col-sm-6">
                <div className="tp-footer-widget footer-col-1 mb-50">
                  <div className="tp-footer-widget-content">
                    <div className="tp-footer-logo text-center mb-3">
                      <Link href="/">
                        <Image 
                          src={logo} 
                          alt="logo" 
                          style={{
                            maxWidth: '160px',
                            maxHeight: '80px',
                            width: 'auto',
                            height: 'auto',
                            objectFit: 'contain',
                            display: 'block',
                            margin: '0 auto'
                          }}
                          width={160}
                          height={80}
                        />
                      </Link>
                    </div>
                    <p className="tp-footer-desc">{t('description')}</p>
                    <div className="tp-footer-social">
                      {social_data.map(s => <a href={s.link} key={s.id} target="_blank">
                        <i className={s.icon}></i>
                      </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-xl-2 col-lg-3 col-md-4 col-sm-6">
                <div className="tp-footer-widget footer-col-2 mb-50">
                  <h4 className="tp-footer-widget-title">{t('myAccountTitle')}</h4>
                  <div className="tp-footer-widget-content">
                    <ul>
                      <li><Link href="/track-order">{t('trackOrders')}</Link></li>
                      <li><Link href="/shipping">{t('shipping')}</Link></li>
                      <li><Link href="/profile">{t('myAccount')}</Link></li>
                      <li><Link href="/profile">{t('orderHistory')}</Link></li>
                      <li><Link href="/returns">{t('returns')}</Link></li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="col-xl-3 col-lg-3 col-md-4 col-sm-6">
                <div className="tp-footer-widget footer-col-3 mb-50">
                  <h4 className="tp-footer-widget-title">{t('informationTitle')}</h4>
                  <div className="tp-footer-widget-content">
                    <ul>
                      <li><Link href="/about">{t('ourStory')}</Link></li>
                      <li><Link href="/privacy-policy">{t('privacyPolicy')}</Link></li>
                      <li><Link href="/terms">{t('termsAndConditions')}</Link></li>
                      <li><Link href="/blog">{t('latestNews')}</Link></li>
                      <li><Link href="/contact">{t('contactUs')}</Link></li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="col-xl-3 col-lg-3 col-md-4 col-sm-6">
                <div className="tp-footer-widget footer-col-4 mb-50">
                  <h4 className="tp-footer-widget-title">{t('talkToUsTitle')}</h4>
                  <div className="tp-footer-widget-content">
                    <div className="tp-footer-talk mb-20">
                      <span>{t('gotQuestions')}</span>
                      <h4><a href="tel:+380123456789">{t('phoneNumber')}</a></h4>
                    </div>
                    <div className="tp-footer-contact">
                      <div className="tp-footer-contact-item d-flex align-items-start">
                        <div className="tp-footer-contact-icon">
                          <span>
                            <Email />
                          </span>
                        </div>
                        <div className="tp-footer-contact-content">
                          <p><a href="mailto:Noxnew@hotmail.com">{t('emailAddress')}</a></p>
                        </div>
                      </div>
                      <div className="tp-footer-contact-item d-flex align-items-start">
                        <div className="tp-footer-contact-icon">
                          <span>
                            <Location />
                          </span>
                        </div>
                        <div className="tp-footer-contact-content">
                          <p><a href="#" target="_blank">{t('address')}</a></p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="tp-footer-bottom">
          <div className="container">
            <div className="tp-footer-bottom-wrapper">
              <div className="row align-items-center">
                <div className="col-md-6">
                  <div className="tp-footer-copyright">
                    <p>{t('copyright', { year: new Date().getFullYear() })}</p>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="tp-footer-payment text-md-end">
                    <p>
                      <Image src={pay} alt="pay" />
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;