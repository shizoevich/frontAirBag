import Wrapper from "@/layout/wrapper";
import Header from "@/layout/headers/header";
import ContactBreadcrumb from "@/components/breadcrumb/contact-breadcrumb";
import ContactArea from "@/components/contact/contact-area";
import ContactMap from "@/components/contact/contact-map";
import Footer from "@/layout/footers/footer";

export const metadata = {
  title: "Shofy - Contact Page",
};

export default function ContactPage() {
  return (
    <Wrapper>
      <Header />
      <ContactBreadcrumb />
      <ContactArea/>
      <ContactMap/>
      <Footer primary_style={true} />
    </Wrapper>
  );
}
