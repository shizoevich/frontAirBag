import Wrapper from "@/layout/wrapper";
import Header from "@/layout/headers/header";
import ProductDetailsArea from "@/components/product-details/product-details-area";
import Footer from "@/layout/footers/footer";

export const metadata = {
  title: "AirBag - Product Details Page",
};

// Generate static params for static export
export async function generateStaticParams() {
  // Return product IDs for static generation
  // Generate IDs from 1 to 50 to cover most product links
  const productIds = [];
  
  // Add numeric IDs from 1 to 50
  for (let i = 1; i <= 50; i++) {
    productIds.push({ id: i.toString() });
  }
  
  // Add some common string IDs
  productIds.push(
    { id: 'sample' },
    { id: 'demo' },
    { id: 'test' }
  );
  
  return productIds;
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
