import { Inter } from 'next/font/google';
import './globals.scss';
import './globals.css';
import '../styles/quantity-buttons.css';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
