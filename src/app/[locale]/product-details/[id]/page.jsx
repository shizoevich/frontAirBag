import Wrapper from "@/layout/wrapper";
import Header from "@/layout/headers/header";
import ProductDetailsArea from "@/components/product-details/product-details-area";
import Footer from "@/layout/footers/footer";

export const metadata = {
  title: "AirBag - Product Details Page",
};

// Generate static params - только для статического экспорта
export async function generateStaticParams() {
  // Если используется статический экспорт, генерируем ограниченный набор
  if (process.env.STATIC_EXPORT === 'true') {
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
  
  // Для ISR возвращаем пустой массив - страницы будут генерироваться по запросу
  return [];
}

// Включаем ISR с revalidation каждые 60 секунд
export const revalidate = 60;

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
