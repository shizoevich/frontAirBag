import Wrapper from "@/layout/wrapper";
import Header from '@/layout/headers/header';
import CommonBreadcrumb from '@/components/breadcrumb/common-breadcrumb';
import CouponArea from '@/components/coupon/coupon-area';
import Footer from '@/layout/footers/footer';

export const metadata = {
  title: "AirBag - Coupon Page",
};

export default function CouponPage() {
  return (
    <Wrapper>
      <Header />
      <CommonBreadcrumb title="Grab Best Offer" subtitle="Coupon" />
      <CouponArea />
      <Footer primary_style={true} />
    </Wrapper>
  );
}
