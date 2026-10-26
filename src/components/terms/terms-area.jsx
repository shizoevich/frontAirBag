'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import phones from '@/data/contact-data';

const TermsArea = () => {
  const params = useParams();
  const t = useTranslations('Terms');

  return (
    <section className="terms-policy-area pt-95 pb-90">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-xl-10">
            <div className="tp-privacy-policy-wrapper">
              <div className="tp-privacy-policy-title mb-30">
                <h4 className="tp-section-title">{t('title')}</h4>
                <p>{t('subtitle')}</p>
              </div>
              
              {/* Section 1 */}
              <div className="tp-privacy-policy-item mb-35">
                <h4 className="tp-privacy-policy-item-title">{t('section1.title')}</h4>
                <p>{t('section1.description1')}</p>
                <p>{t('section1.description2')}</p>
                <p>{t('section1.description3')}</p>
              </div>
              
              {/* Section 2 */}
              <div className="tp-privacy-policy-item mb-35">
                <h4 className="tp-privacy-policy-item-title">{t('section2.title')}</h4>
                <p>
                  {t.rich('section2.description1', {
                    bot: (chunks) => <a href="https://t.me/AirBagAD_bot" target="_blank" rel="noopener noreferrer" className="text-primary">{chunks}</a>,
                  })}
                </p>
                <p>{t('section2.description2')}</p>
                <p>{t('section2.description3')}</p>
              </div>
              
              {/* Section 3 */}
              <div className="tp-privacy-policy-item mb-35">
                <h4 className="tp-privacy-policy-item-title">{t('section3.title')}</h4>
                <p>{t('section3.description1')}</p>
                <p>{t('section3.description2')}</p>
                <p>{t('section3.description3')}</p>
              </div>
              
              {/* Section 4 */}
              <div className="tp-privacy-policy-item mb-35">
                <h4 className="tp-privacy-policy-item-title">{t('section4.title')}</h4>
                <p>{t('section4.description1')}</p>
                <p>{t('section4.description2')}</p>
                <p>
                  {t.rich('section4.description3', {
                    contact: (chunks) => <Link href={`/${params.locale}/contact`} className="text-primary">{chunks}</Link>,
                  })}
                </p>
              </div>
              
              {/* Section 5 */}
              <div className="tp-privacy-policy-item mb-35">
                <h4 className="tp-privacy-policy-item-title">{t('section5.title')}</h4>
                <p>{t('section5.description')}</p>
                <ul>
                  <li>{t('section5.items.item1')}</li>
                  <li>{t('section5.items.item2')}</li>
                  <li>{t('section5.items.item3')}</li>
                </ul>
              </div>
              
              {/* Section 6 */}
              <div className="tp-privacy-policy-item mb-35">
                <h4 className="tp-privacy-policy-item-title">{t('section6.title')}</h4>
                <p>{t('section6.description1')}</p>
                <p>{t('section6.description2')}</p>
                <p>
                  <Link href="/privacy-policy" className="text-primary">
                    {t('section6.privacyPolicyLink')}
                  </Link>
                </p>
              </div>
              
              {/* Section 7 */}
              <div className="tp-privacy-policy-item">
                <h4 className="tp-privacy-policy-item-title">{t('section7.title')}</h4>
                <p>{t('section7.description')}</p>
                <ul>
                  <li>
                    📞{' '}
                    {phones.map((phone, index) => (
                      <React.Fragment key={phone.id}>
                        {index > 0 && ', '}
                        <a href={`tel:${phone.tel}`} className="text-primary">{phone.displayFull}</a>
                      </React.Fragment>
                    ))}
                  </li>
                  <li>
                    📧 <a href={`mailto:${t('section7.email')}`} className="text-primary">{t('section7.email')}</a>
                  </li>
                  <li>
                    🤖{' '}
                    <a href="https://t.me/AirBagAD_bot" target="_blank" rel="noopener noreferrer" className="text-primary">
                      {t('section7.telegram')}
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TermsArea;
