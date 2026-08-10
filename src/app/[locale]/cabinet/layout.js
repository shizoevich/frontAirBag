import { NOINDEX } from '@/utils/seo';

// Personal cabinet — user-specific, must never be indexed. Lives in a layout because
// the page itself is a client component and cannot export metadata.
export const metadata = { robots: NOINDEX };

export default function PrivateLayout({ children }) {
  return <>{children}</>;
}
