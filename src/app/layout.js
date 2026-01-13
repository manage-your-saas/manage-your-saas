import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import "./fonts.css";
import Navbar from './components/Navbar';

const inter = Inter({ subsets: ['latin'] });
const playfair = Playfair_Display({ 
  subsets: ['latin'],
  style: ['italic'],
  variable: '--font-playfair',
  display: 'swap',
});

export const metadata = {
  title: 'ManageYourSaaS',
  description: 'Run your entire SaaS from one simple dashboard',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${playfair.variable}`}>
      <body className={inter.className}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
