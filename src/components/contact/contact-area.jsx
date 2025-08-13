'use client'
import React from "react";
import Image from "next/image";
import { useTranslations } from 'next-intl';
// internal
import ContactForm from "../forms/contact-form";
import contact_icon_1 from "@assets/img/contact/contact-icon-1.png";
import contact_icon_2 from "@assets/img/contact/contact-icon-2.png";
import contact_icon_3 from "@assets/img/contact/contact-icon-3.png";

const ContactArea = () => {
  const t = useTranslations('Contact');
  return (
    <>
      <section className="tp-contact-area pb-100">
        <div className="container">
          <div className="tp-contact-inner">
            <div className="row">
              <div className="col-xl-9 col-lg-8">
                <div className="tp-contact-wrapper">
                  <h3 className="tp-contact-title">{t('sendMessage')}</h3>
                  <div className="tp-contact-form">
                    <ContactForm />
                    <p className="ajax-response"></p>
                  </div>
                </div>
              </div>
              <div className="col-xl-3 col-lg-4">
                <div className="tp-contact-info-wrapper">
                  <div className="tp-contact-info-item">
                    <div className="tp-contact-info-icon">
                      <span>
                        <Image src={contact_icon_1} alt="contact-icon" />
                      </span>
                    </div>
                    <div className="tp-contact-info-content">
                      <p data-info="mail">
                        <span>{t('email')}</span>
                        <a href={`mailto:${t('emailAddress')}`}>{t('emailAddress')}</a>
                      </p>
                      <p data-info="phone">
                        <span>{t('phone')}</span>
                        <a href={`tel:${t('phoneNumber')}`}>{t('phoneNumber')}</a>
                      </p>
                    </div>
                  </div>
                  <div className="tp-contact-info-item">
                    <div className="tp-contact-info-icon">
                      <span>
                        <Image src={contact_icon_2} alt="contact-icon" />
                      </span>
                    </div>
                    <div className="tp-contact-info-content">
                      <p>
                        <span>{t('delivery')}</span>
                        <span>{t('deliveryInfo')}</span>
                      </p>
                      <p>
                        <span>{t('workingHours')}</span>
                        <span>{t('workingDays')}</span><br/>
                        <span>{t('weekend')}</span>
                      </p>
                    </div>
                  </div>
                  <div className="tp-contact-info-item">
                    <div className="tp-contact-info-icon">
                      <span>
                        <Image src={contact_icon_3} alt="contact-icon" />
                      </span>
                    </div>
                    <div className="tp-contact-info-content">
                      <div className="tp-contact-social-wrapper mt-5">
                        <h4 className="tp-contact-social-title">
                          {t('socialNetworks')}
                        </h4>
                        <div className="tp-contact-social-icon">
                          <a href="https://t.me/AirBagAD_bot" target="_blank" rel="noopener noreferrer" aria-label="Telegram">
                            <i className="fa-brands fa-telegram"></i>
                          </a>
                          <a href="https://tiktok.com/@airbag_ad" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
                            <i className="fa-brands fa-tiktok"></i>
                          </a>
                          <a href="https://instagram.com/dmytro_gekalo" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                            <i className="fa-brands fa-instagram"></i>
                          </a>
                          <a href="https://facebook.com/dmytro.gekalo" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                            <i className="fa-brands fa-facebook-f"></i>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ContactArea;
