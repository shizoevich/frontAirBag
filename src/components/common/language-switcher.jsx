'use client';

import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const languages = {
  en: 'English',
  ru: 'Русский',
  uk: 'Українська',
};

const LanguageSwitcher = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const locales = Object.keys(languages);
  
  // Extract locale from pathname (first segment)
  const locale = pathname?.split('/')[1] || 'en';
  const asPath = pathname;

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    // Check on mount
    checkScreenSize();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkScreenSize);
    
    // Clean up
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const handleLanguageChange = (newLocale) => {
    // remove the current locale from the pathname
    const pathWithoutLocale = pathname.startsWith(`/${locale}`) 
      ? pathname.substring(locale.length + 1) 
      : pathname;
    
    // Ensure we don't have double slashes
    const newPath = `/${newLocale}${pathWithoutLocale}`.replace(/\/\//, '/');
    router.push(newPath);
    setIsOpen(false);
  };

  return (
    <div className="tp-header-top-menu-item tp-header-setting">
      <span 
        onClick={() => setIsOpen(!isOpen)}
        className="tp-header-setting-toggle"
        id="tp-lang-toggle"
        style={{
          color: isMobile ? '#000' : '#fff'
        }}
      >
        {languages[locale]}
      </span>
      <ul 
        className={`offcanvas__lang-list ${isOpen ? 'open' : ''}`}
        style={{
          position: 'absolute',
          right: 0,
          top: isMobile ? 'auto' : '100%',
          bottom: isMobile ? '100%' : 'auto',
          background: '#fff',
          borderRadius: '4px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          minWidth: '120px',
          padding: '5px 0',
          zIndex: 999,
          opacity: isOpen ? 1 : 0,
          visibility: isOpen ? 'visible' : 'hidden',
          transform: isOpen ? 'translateY(0)' : `translateY(${isMobile ? '10px' : '-10px'})`,
          transition: 'all 0.3s ease',
          marginBottom: isMobile ? '5px' : 0,
          marginTop: !isMobile ? '5px' : 0,
        }}
      >
        {locales.map((loc) => (
          <li key={loc}>
            <Link 
              href={`/${loc}${pathname.substring(3)}`}
              onClick={(e) => {
                e.preventDefault();
                handleLanguageChange(loc);
              }}
              style={{
                display: 'block',
                padding: '5px 15px',
                color: '#333',
                fontSize: '13px',
                textDecoration: 'none',
                whiteSpace: 'nowrap',
              }}
            >
              {languages[loc]}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LanguageSwitcher;
