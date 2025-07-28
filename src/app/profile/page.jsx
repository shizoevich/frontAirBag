import Wrapper from "@/layout/wrapper";
import HeaderTwo from "@/layout/headers/header-2";
import Footer from "@/layout/footers/footer";
import ProfileArea from "@/components/my-account/profile-area";

export const metadata = {
  title: "Shofy - Profile Page",
};

export default function ProfilePage() {
  return (
    <Wrapper>
      <HeaderTwo style_2={true} />
      <ProfileArea />
      <Footer style_2={true} />
    </Wrapper>
  );
}
