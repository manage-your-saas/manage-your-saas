import { Metadata } from 'next';
import LandingPage from './components/page';

export const metadata = {
  title: 'Manage Your SaaS',
  description: 'Run your entire SaaS from one simple dashboard. Manage social media, ads, SEO, user analytics, and more in one place.',
};

export default function Home() {
  return <LandingPage />;
}