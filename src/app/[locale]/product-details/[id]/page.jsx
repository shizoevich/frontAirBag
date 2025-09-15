import Wrapper from "@/layout/wrapper";
import Header from "@/layout/headers/header";
import ProductDetailsArea from "@/components/product-details/product-details-area";
import Footer from "@/layout/footers/footer";

export const metadata = {
  title: "AirBag - Product Details Page",
};

// Generate static params for static export
export async function generateStaticParams() {
  // Return some sample product IDs for static generation
  // In a real app, you would fetch these from your API
  return [
    { id: '1' },
    { id: '2' },
    { id: '3' },
    { id: 'sample' },
  ];
}

export default async function ProductDetailsPage({ params }) {
  const { id } = await params;
  
  return (
    <Wrapper>
      <Header />
      <ProductDetailsArea id={id} />
      <Footer primary_style={true} />
    </Wrapper>
  );
}
