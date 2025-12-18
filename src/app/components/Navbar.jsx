'use client';
import { useState, useEffect } from 'react';
import logo from '../../../public/logo.svg';
import Image from 'next/image';
import { FiSun, FiMoon } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);


export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };

    fetchUser();
  }, []);

  const handleGetStarted = () => {
    if (user) {
      router.push('/dashboard/seo');
    } else {
      router.push('/signup');
    }
  };

  return (
    <nav style={{fontFamily:"var(--font-story-script)"}} className="w-full bg-white border-2 fixed top-0 left-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Image width={30} height={30} src={logo} alt="ManageYourSaaS Logo" />
            <span className="text-xl font-bold text-gray-900"> ManageYourSaaS</span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <a href="/" className="text-xl xl:text-1xl lg:text-2xl text-gray-600 hover:text-gray-900 transition-colors">Home</a>
            <a href="#features" className="text-xl xl:text-1xl lg:text-2xl text-gray-600 hover:text-gray-900 transition-colors">Features</a>
            <Link href="/pricing" className="text-xl xl:text-1xl lg:text-2xl text-gray-600 hover:text-gray-900 transition-colors">Pricing</Link>
            <a href="#about" className="text-xl xl:text-1xl lg:text-2xl text-gray-600 hover:text-gray-900 transition-colors">About</a>
          </div>
          <div className="flex items-center space-x-4">
            <a 
              href="https://discord.gg/3nTT9HnjJR" 
              className="text-lg border-2 bg-violet-400 font-bold lg:text-1xl xl:text-2xl text-black border-black hover:text-gray-900 px-3 py-2 rounded-md"
            >
              Discord
            </a>
            <button 
              onClick={handleGetStarted}
              className="text-lg lg:text-1xl xl:text-2xl p-3 bg-black text-white rounded font-bold hover:opacity-90 transition"
            >
              Get Started
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
