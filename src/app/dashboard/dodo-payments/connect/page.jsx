'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { DashboardSidebar } from "../../seo/dashboard-sidebar"
import { DashboardTopbar } from "../../seo/dashboard-topbar"
import { Key, Shield, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function DodoPaymentsConnectPage() {
  const router = useRouter();
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Get user from localStorage or session
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }

      // Validate and save API key
      const response = await fetch('/api/dodo-payments/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiKey,
          userId: user.id
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          router.push('/dashboard/dodo-payments');
        }, 2000);
      } else {
        setError(data.error || 'Failed to connect Dodo Payments account');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col lg:ml-72">
        <DashboardTopbar />
        
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Key className="w-10 h-10 text-emerald-600" />
              </div>
              <h1 className="text-3xl font-bold mb-4">Connect Dodo Payments</h1>
              <p className="text-muted-foreground text-lg">
                Enter your Dodo Payments API key to connect your account and start tracking revenue
              </p>
            </div>

            {/* Security Trust Badge */}
            <div className="mb-8 bg-linear-to-br from-emerald-100 to-teal-100 border border-emerald-500 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center shrink-0">
                  <Shield className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-emerald-900 mb-2">🔒 Your API Keys Are Safe With Us</h3>
                  <p className="text-sm text-emerald-800 mb-3">
                    We take your security seriously. Your API keys are encrypted at rest and in transit using industry-standard AES-256 encryption. We never share, sell, or misuse your credentials.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-emerald-600" />
                      <span className="text-emerald-700">256-bit Encryption</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-emerald-600" />
                      <span className="text-emerald-700">Secure Storage</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-emerald-600" />
                      <span className="text-emerald-700">No Data Sharing</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Connection Form */}
            <div className="bg-card rounded-2xl border border-border p-8">
              {success ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">🎉 Successfully Connected!</h3>
                  <p className="text-muted-foreground mb-2">
                    Your API key is now securely encrypted and stored. You're all set to track your revenue!
                  </p>
                  <p className="text-sm text-emerald-600">
                    Redirecting you to your dashboard...
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* API Key Input */}
                  <div>
                    <label htmlFor="apiKey" className="block text-sm font-medium mb-2">
                      Dodo Payments API Key
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        id="apiKey"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="e.g: ZXbsxxxxxxxxxxxxxxxxxxx..."
                        className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 pr-12"
                        required
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Shield className="w-5 h-5 text-muted-foreground" />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      🔐 Your API key is encrypted with AES-256 and stored securely. We never share or misuse your credentials. Find it in your Dodo Payments dashboard.
                    </p>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-xl">
                      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading || !apiKey.trim()}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-muted disabled:text-muted-foreground text-white font-medium py-3 px-4 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      'Connect Account'
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Help Section */}
            <div className="mt-8 bg-muted/30 rounded-2xl p-6">
              <h3 className="font-semibold mb-3">Where to find your API key?</h3>
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                    <Key className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-emerald-900">🚀 Quick Access</p>
                    <a 
                      href="https://app.dodopayments.com/developer/api-keys" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-emerald-600 hover:text-emerald-700 underline flex items-center gap-1 mt-1"
                    >
                      Go to Dodo Payments API Keys →
                    </a>
                  </div>
                </div>
              </div>
              <ol className="space-y-2 text-sm text-muted-foreground">
                <li>1. Click the link above or log in to your Dodo Payments dashboard</li>
                <li>2. Navigate to Settings → API Keys</li>
                <li>3. Click "Generate New Key" or copy an existing key</li>
                <li>4. Make sure the key has "Read" permissions for revenue data</li>
              </ol>
            </div>  
          </div>
        </main>
      </div>
    </div>
  );
}
