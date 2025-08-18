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
      <section className="tp-contact-area py-60">
        <div className="container">
          <div className="tp-contact-inner">
            <div className="row">
              <div className="col-xl-6 col-lg-6 mb-4 mb-lg-0">
                <div className="tp-contact-wrapper p-4 bg-light rounded-3">
                  <h3 className="tp-contact-title mb-4">{t('title')}</h3>
                  <p className="mb-4">{t('subtitle')}</p>
                  
                  <div className="tp-contact-info-compact mb-4">
                    <div className="contact-item d-flex align-items-center mb-3">
                      <i className="far fa-envelope text-dark fs-5 me-3"></i>
                      <div>
                        <h5 className="mb-1">{t('email')}</h5>
                        <a href="mailto:Noxnew@hotmail.com" className="text-primary">Noxnew@hotmail.com</a>
                      </div>
                    </div>
                    
                    <div className="contact-item d-flex align-items-center mb-3">
                      <i className="far fa-phone-alt text-dark fs-5 me-3"></i>
                      <div>
                        <h5 className="mb-1">{t('phone')}</h5>
                        <a href="tel:+380989989828" className="text-primary">+38 (098) 998-98-28</a>
                      </div>
                    </div>
                    
                    <div className="contact-item d-flex align-items-center mb-3">
                      <i className="far fa-shipping-fast text-dark fs-5 me-3"></i>
                      <div>
                        <h5 className="mb-1">{t('delivery')}</h5>
                        <p className="mb-0">Нова Пошта, відправка протягом 1-3 днів</p>
                      </div>
                    </div>
                    
                    <div className="contact-item d-flex align-items-center mb-3">
                      <i className="far fa-clock text-dark fs-5 me-3"></i>
                      <div>
                        <h5 className="mb-1">{t('workingHours')}</h5>
                        <p className="mb-0">Пн-Сб: 9:00 - 19:00<br/>Нд: Вихідний</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="tp-contact-social-wrapper">
                    <h4 className="tp-contact-social-title mb-3">
                      Знайдіть нас у соціальних мережах
                    </h4>
                    <p className="mb-3">Слідкуйте за нами в соціальних мережах, щоб бути в курсі останніх новин та акцій</p>
                    <div className="tp-contact-social-icon">
                      <a href="https://t.me/AirBagAD_bot" target="_blank" rel="noopener noreferrer" aria-label="Telegram" className="me-2">
                        <i className="fa-brands fa-telegram fs-4"></i>
                      </a>
                      <a href="https://tiktok.com/@airbag_ad" target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="me-2">
                        <i className="fa-brands fa-tiktok fs-4"></i>
                      </a>
                      <a href="https://instagram.com/dmytro_gekalo" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="me-2">
                        <i className="fa-brands fa-instagram fs-4"></i>
                      </a>
                      <a href="https://facebook.com/dmytro.gekalo" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="me-2">
                        <i className="fa-brands fa-facebook-f fs-4"></i>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="col-xl-6 col-lg-6">
                <div className="tp-contact-form-wrapper p-4 bg-light rounded-3">
                  <h3 className="tp-contact-title mb-4">{t('sendMessage')}</h3>
                  <div className="tp-contact-form">
                    <ContactForm />
                    <p className="ajax-response"></p>
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
