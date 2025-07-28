import Link from "next/link";
import Image from "next/image";
import Wrapper from "@/layout/wrapper";
import HeaderTwo from "@/layout/headers/header-2";
import Footer from "@/layout/footers/footer";
import error from '@assets/img/error/error.png';

export const metadata = {
  title: "Error Page",
};

export default function NotFound() {
  return (
    <Wrapper>
      <HeaderTwo style_2={true} />
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

                <Link href="/" className="tp-error-btn">
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
