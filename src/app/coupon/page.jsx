import Wrapper from "@/layout/wrapper";
import Header from '@/layout/headers/header';
import CouponArea from '@/components/coupon/coupon-area';
import Footer from '@/layout/footers/footer';

export const metadata = {
  title: "AirBag - Coupon Page",
};

export default function CouponPage() {
  return (
    <Wrapper>
      <Header />
      <CouponArea />
      <Footer primary_style={true} />
    </Wrapper>
  );
}
