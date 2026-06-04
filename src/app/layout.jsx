// Global styles are imported once here, at the root.
// The actual <html>/<body> shell lives in `app/[locale]/layout.jsx`,
// where the correct `lang` attribute is known (next-intl pattern).
// This root layout is a pass-through so we don't render nested <html> tags.
import './globals.scss';
import './globals.css';
import '../styles/quantity-buttons.css';

export default function RootLayout({ children }) {
  return children;
}
