import Wrapper from "@/layout/wrapper";
import HeaderTwo from "@/layout/headers/header-2";
import Footer from "@/layout/footers/footer";
import CommonBreadcrumb from "@/components/breadcrumb/common-breadcrumb";
import ForgotArea from "@/components/login-register/forgot-area";

export const metadata = {
  title: "Shofy - Forgot Page",
};

export default function ForgotPage() {
  return (
    <Wrapper>
      <HeaderTwo style_2={true} />
      <CommonBreadcrumb title="Forgot Password" subtitle="Reset Password" center={true} />
      <ForgotArea />
      <Footer primary_style={true} />
    </Wrapper>
  );
}
