import Wrapper from "@/layout/wrapper";
import Header from "@/layout/headers/header";
import Footer from "@/layout/footers/footer";
import CommonBreadcrumb from "@/components/breadcrumb/common-breadcrumb";
import RegisterArea from "@/components/login-register/register-area";

export const metadata = {
  title: "AirBag - Register Page",
};

export default function RegisterPage() {
  return (
    <Wrapper>
      <Header />
      <CommonBreadcrumb title="Register" subtitle="Register" center={true} />
      <RegisterArea />
      <Footer primary_style={true} />
    </Wrapper>
  );
}
