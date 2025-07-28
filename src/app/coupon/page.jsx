import Wrapper from "@/layout/wrapper";
import HeaderTwo from '@/layout/headers/header-2';
import CommonBreadcrumb from '@/components/breadcrumb/common-breadcrumb';
import CouponArea from '@/components/coupon/coupon-area';
import Footer from '@/layout/footers/footer';

export const metadata = {
  title: "Shofy - Coupon Page",
};

export default function CouponPage() {
  return (
    <Wrapper>
      <HeaderTwo style_2={true} />
      <CommonBreadcrumb title="Grab Best Offer" subtitle="Coupon" />
      <CouponArea />
      <Footer primary_style={true} />
    </Wrapper>
  );
}
