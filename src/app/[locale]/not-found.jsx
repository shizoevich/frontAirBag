'use client';
import Link from "next/link";
import Image from "next/image";
import { useLocale } from 'next-intl';
import Wrapper from "@/layout/wrapper";
import Header from "@/layout/headers/header";
import Footer from "@/layout/footers/footer";
import error from '@assets/img/error/error.png';

export const metadata = {
  title: "Error Page",
};

export default function NotFound() {
  const locale = useLocale();

  // Функция для добавления локали к ссылкам
  const getLocalizedLink = (link) => {
    if (!link) return '#';
    if (link.startsWith('/')) {
      return `/${locale}${link}`;
    }
    return link;
  };
  return (
    <Wrapper>
      <Header />
      {/* 404 area start */}
      <section className="tp-error-area pt-110 pb-110">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-xl-6 col-lg-8 col-md-10">
              <div className="tp-error-content text-center">
                <div className="tp-error-thumb">
                  <Image src={error} alt="error img" />
                </div>

                <h3 className="tp-error-title">Oops! Page not found</h3>
                <p>
                  Whoops, this is embarrassing. Looks like the page you were
                  looking for was not found.
                </p>

                <Link href={getLocalizedLink("/")} className="tp-error-btn">
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* 404 area end */}
      <Footer primary_style={true} />
    </Wrapper>
  );
}
