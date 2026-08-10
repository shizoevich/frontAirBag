import { NOINDEX } from '@/utils/seo';

export const metadata = {
  title: "AirBag - Search Page",
  description: "Search products in our store",
  // Search result pages are infinite and thin — never index them.
  robots: NOINDEX,
};

export default function SearchLayout({ children }) {
  return <>{children}</>;
}
