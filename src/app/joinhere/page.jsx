'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function JoinHere() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: '', isError: false });
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setMessage({ text: 'Please enter your email', isError: true });
      return;
    }

    setIsSubmitting(true);
    try {
      // Here you would typically send this to your backend
      // For now, we'll just simulate an API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Clear form and show success message
      setEmail('');
      setMessage({ 
        text: 'Thank you! We\'ll notify you when we launch!', 
        isError: false 
      });
      
      // Optionally redirect after a delay
      setTimeout(() => {
        router.push('/');
      }, 3000);
    } catch (error) {
      setMessage({ 
        text: 'Something went wrong. Please try again.', 
        isError: true 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ fontFamily: "var(--font-story-script)" }} className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl xl:text-4xl lg:text-5xl font-bold text-gray-900 mb-3">Coming Soon!</h1>
          <p className="text-1xl xl:text-2xl lg:text-3xl text-gray-600">
            We're currently building something amazing. Enter your email to get notified when we launch!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-xl xl:text-1xl lg:text-2xl font-medium text-gray-700 mb-1">
              Email address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder="your@email.com"
              required
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
            {isSubmitting ? 'Submitting...' : 'Notify Me'}
          </button>

          {message.text && (
            <div className={`mt-4 p-3 rounded-lg ${
              message.isError ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
            }`}>
              {message.text}
            </div>
          )}
        </form>

        <div className="mt-8 text-center">
          <button
            onClick={() => router.push('/')}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}