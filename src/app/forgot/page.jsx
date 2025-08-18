import Wrapper from "@/layout/wrapper";
import Header from "@/layout/headers/header";
import Footer from "@/layout/footers/footer";
import ForgotArea from "@/components/login-register/forgot-area";

export const metadata = {
  title: "AirBag - Forgot Page",
};

export default function ForgotPage() {
  return (
    <Wrapper>
      <Header />
      <ForgotArea />
      <Footer primary_style={true} />
    </Wrapper>
  );
}
