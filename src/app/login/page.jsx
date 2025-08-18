import Wrapper from "@/layout/wrapper";
import Header from "@/layout/headers/header";
import Footer from "@/layout/footers/footer";
import LoginArea from "@/components/login-register/login-area";

export const metadata = {
  title: "AirBag - Login Page",
};

export default function LoginPage() {
  return (
    <Wrapper>
      <Header />
      <LoginArea/>
      <Footer primary_style={true} />
    </Wrapper>
  );
}
