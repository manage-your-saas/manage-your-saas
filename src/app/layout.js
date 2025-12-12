import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import "./fonts.css";

const inter = Inter({ subsets: ['latin'] });
const playfair = Playfair_Display({ 
  subsets: ['latin'],
  style: ['italic'],
  variable: '--font-playfair',
  display: 'swap',
});

export const metadata = {
  title: 'Manage Your SaaS - All-in-One Dashboard',
  description: 'Run your entire SaaS from one simple dashboard',
  verification: {
    google: 'DdCQpAAt_2GhJqxvq93QKC7XccLHxSQYoWUQHCliXBA',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${playfair.variable}`}>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
