'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';

export default function OAuth() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const [message, setMessage] = useState('');

  const handleSearchConsoleConnect = () => {
    // No email needed - Google will provide it during OAuth
    // Redirect to Google OAuth (email will be fetched from Google)
    window.location.href = '/api/google/auth';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Connect Your Services</h1>
          <p className="text-gray-600 mb-4">Connect your accounts to manage everything in one place</p>
          {email && (
            <p className="text-sm text-gray-500">Logged in as: {email}</p>
          )}
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg mb-4">
            <p className="text-sm">ℹ️ When you connect, Google will ask you to select your account. Your email will be automatically retrieved.</p>
          </div>
          {message && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {message}
            </div>
          )}
        </div>

        <div className='text-xl lg:text-2xl border-2 border-black flex flex-col gap-4 justify-center items-center p-8 bg-white rounded-2xl shadow-xl' style={{ fontFamily: "var(--font-story-script)" }}>    
          <a
            href={`https://connect.stripe.com/oauth/authorize?response_type=code&client_id=${process.env.NEXT_PUBLIC_STRIPE_CLIENT_ID || 'YOUR_STRIPE_CLIENT_ID'}&scope=read_write`}
            className="px-6 py-3 border-4 border-black bg-violet-500 text-white rounded hover:bg-violet-600 transition"
          >
            Connect Stripe
          </a>

          <button 
            onClick={handleSearchConsoleConnect}
            className='bg-amber-500 border-4 border-black p-4 rounded hover:bg-amber-600 transition text-white font-medium'
          >
            Connect to Search Console
          </button>
          
          <a 
            className='bg-amber-400 border-4 border-black p-4 rounded hover:bg-amber-500 transition text-white font-medium' 
            href="/api/google/auth"
          >
            Connect to Google Analytics
          </a>
          
          <a className='bg-amber-700 border-4 border-black p-4 rounded hover:bg-amber-800 transition text-white font-medium' href="">Connect to Reddit</a>
          <a className='bg-blue-500 border-4 border-black p-4 rounded hover:bg-blue-600 transition text-white font-medium' href="">Connect to Linkedin</a>
          <a className='bg-black p-4 border-4 border-black rounded hover:bg-gray-800 transition text-white font-medium' href="">Connect to X</a>
          <a className='bg-green-500 border-4 border-black p-4 rounded hover:bg-green-600 transition text-white font-medium' href="">Connect to Mail</a>
        </div>

        <div className="mt-6 text-center">
          <Link 
            href={email ? `/seo?email=${encodeURIComponent(email)}` : '/seo'}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            → Go to SEO Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
