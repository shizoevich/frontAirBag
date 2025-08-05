import Wrapper from "@/layout/wrapper";
import Header from "@/layout/headers/header";
import Footer from "@/layout/footers/footer";
import CommonBreadcrumb from "@/components/breadcrumb/common-breadcrumb";
import WishlistArea from "@/components/cart-wishlist/wishlist-area";

export const metadata = {
  title: "Shofy - Wishlist Page",
};

export default function WishlistPage() {
  return (
    <Wrapper>
      <Header />
      <CommonBreadcrumb title="Wishlist" subtitle="Wishlist" />
      <WishlistArea />
      <Footer primary_style={true} />
    </Wrapper>
  );
}
