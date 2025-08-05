import Wrapper from "@/layout/wrapper";
import Header from "@/layout/headers/header";
import Footer from "@/layout/footers/footer";
import CommonBreadcrumb from "@/components/breadcrumb/common-breadcrumb";
import LoginArea from "@/components/login-register/login-area";

export const metadata = {
  title: "Shofy - Login Page",
};

export default function LoginPage() {
  return (
    <Wrapper>
      <Header />
      <CommonBreadcrumb title="Login" subtitle="Login" center={true} />
      <LoginArea/>
      <Footer primary_style={true} />
    </Wrapper>
  );
}
