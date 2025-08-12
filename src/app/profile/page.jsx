import Wrapper from "@/layout/wrapper";
import Header from "@/layout/headers/header";
import Footer from "@/layout/footers/footer";
import ProfileArea from "@/components/my-account/profile-area";

export const metadata = {
  title: "AirBag - Profile Page",
};

export default function ProfilePage() {
  return (
    <Wrapper>
      <Header />
      <ProfileArea />
      <Footer style_2={true} />
    </Wrapper>
  );
}
