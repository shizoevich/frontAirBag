import React from 'react';
import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import Wrapper from '@/layout/wrapper';
import Header from '@/layout/headers/header';
import Footer from '@/layout/footers/footer';
import TermsArea from '@/components/terms/terms-area';
import { buildAlternates } from '@/utils/seo';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Terms' });

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: buildAlternates('terms', locale),
  };
}

const TermsPage = () => {
  return (
    <Wrapper>
      <Header />
      <div className="terms-page pt-80 pb-80">
        <TermsArea />
      </div>
      <Footer />
    </Wrapper>
  );
};

export default TermsPage;
