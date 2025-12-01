'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function JoinHere() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: '', isError: false });
  const router = useRouter();
  const [isDark, setIsDark] = useState(false);
  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };
  const handleSubmit = async (e) => {
  e.preventDefault();
  if (!email) {
    setMessage({ text: 'Please enter your email', isError: true });
    return;
  }

  setIsSubmitting(true);
  try {
    console.log('Sending request to /api/subscribe...');
    const response = await fetch('/api/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json().catch(() => ({}));
    console.log('Response status:', response.status, 'Data:', data);

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! Status: ${response.status}`);
    }

    setEmail('');
    setMessage({ 
      text: data.message || 'Successfully joined the waitlist!', 
      isError: false 
    });

    setTimeout(() => {
      router.push('/');
    }, 2000);

  } catch (error) {
    console.error('Submission error:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    
    setMessage({ 
      text: error.message || 'Something went wrong. Please try again.', 
      isError: true 
    });
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="p-8 sm:p-10">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              Join Our Waitlist
            </h1>
            <p className="text-gray-600">
              We're currently in development. Enter your email to get early access!
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label 
                htmlFor="email" 
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                placeholder="you@example.com"
                required
                disabled={isSubmitting}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 px-4 rounded-lg font-medium text-white ${
                isSubmitting 
                  ? 'bg-blue-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              } transition-colors`}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                'Get Early Access'
              )}
            </button>

            {message.text && (
              <div 
                className={`p-3 rounded-lg text-center ${
                  message.isError 
                    ? 'bg-red-50 text-red-700' 
                    : 'bg-green-50 text-green-700'
                }`}
              >
                {message.text}
              </div>
            )}
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => router.push('/')}
              className="text-blue-600 hover:text-blue-800 font-medium text-sm"
              disabled={isSubmitting}
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}