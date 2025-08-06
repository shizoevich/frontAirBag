'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';
import Image from 'next/image';
import language_img from '@assets/img/icon/language-flag.png';

const languages = {
  en: 'English',
  ru: 'Русский',
  uk: 'Українська',
};

const LanguageSwitcher = () => {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const handleLanguageChange = (newLocale) => {
    // remove the current locale from the pathname
    const newPath = pathname.startsWith(`/${locale}`) ? pathname.substring(locale.length + 1) : pathname;
    router.replace(`/${newLocale}${newPath}`);
    setIsOpen(false);
  };

  return (
    <div className="offcanvas__select language">
      <div className="offcanvas__lang d-flex align-items-center justify-content-md-end">
        <div className="offcanvas__lang-img mr-15">
          <Image src={language_img} alt="language-flag" />
        </div>
        <div className="offcanvas__lang-wrapper">
          <span onClick={() => setIsOpen(!isOpen)} className="offcanvas__lang-selected-lang tp-lang-toggle" id="tp-offcanvas-lang-toggle">
            {languages[locale]}
          </span>
          <ul className={`offcanvas__lang-list tp-lang-list ${isOpen ? 'tp-lang-list-open' : ''}`}>
            {Object.keys(languages).map((lang) => (
              <li key={lang} onClick={() => handleLanguageChange(lang)} style={{ cursor: 'pointer' }}>
                {languages[lang]}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default LanguageSwitcher;
