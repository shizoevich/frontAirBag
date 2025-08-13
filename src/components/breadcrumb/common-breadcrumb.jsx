'use client';
import React from "react";
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useParams } from 'next/navigation';

const CommonBreadcrumb = ({
  title,
  subtitle,
  center = false,
  bg_clr = false,
}) => {
  const t = useTranslations('Common');
  const { locale } = useParams();
  return (
    <section
      className={`breadcrumb__area ${
        center ? "text-center" : ""
      } include-bg pt-95 pb-50`}
      style={{ backgroundColor: bg_clr && `#EFF1F5` }}
    >
      <div className="container">
        <div className="row">
          <div className="col-xxl-12">
            <div className="breadcrumb__content p-relative z-index-1">
              <h3 className="breadcrumb__title">{title}</h3>
              <div className="breadcrumb__list">
                <span>
                  <Link href={`/${locale}`}>{t('home')}</Link>
                </span>
                <span>{subtitle}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CommonBreadcrumb;
