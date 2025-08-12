'use client';
import React from 'react';
import Head from 'next/head';

const SEO = ({ pageTitle }) => {
  return (
    <Head>
      <title>
        {pageTitle && `${pageTitle} | `}AirBag - Магазин автозапчастей
      </title>
      <meta httpEquiv="x-ua-compatible" content="ie=edge" />
      <meta name="description" content="AirBag - Магазин автозапчастей" />
      <meta name="robots" content="noindex, follow" />
      <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
      <link rel="icon" href="/favicon.ico" />
    </Head>
  );
};

export default SEO;
