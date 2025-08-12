import Wrapper from "@/layout/wrapper";
import Header from "@/layout/headers/header";
import Footer from "@/layout/footers/footer";
import CommonBreadcrumb from "@/components/breadcrumb/common-breadcrumb";
import ForgotArea from "@/components/login-register/forgot-area";

export const metadata = {
  title: "AirBag - Forgot Page",
};

export default function ForgotPage() {
  return (
    <Wrapper>
      <Header />
      <CommonBreadcrumb title="Forgot Password" subtitle="Reset Password" center={true} />
      <ForgotArea />
      <Footer primary_style={true} />
    </Wrapper>
  );
}
