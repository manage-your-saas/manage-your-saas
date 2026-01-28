'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertTriangle, X, ArrowUpRight } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { DashboardSidebar } from "../seo/dashboard-sidebar"
import { DashboardTopbar } from "../seo/dashboard-topbar"
import { RevenueMetrics } from "./revenue-metrics"
import { RevenueChart } from "./revenue-chart"
import { SubscriptionHealth } from "./subscription-health"
import { RecentTransactions } from "./recent-transactions"
import { CustomerMetrics } from "./customer-metrics"
import { Products } from "./products"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

function DodoPaymentsDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check for success/error messages from URL params
  useEffect(() => {
    const success = searchParams.get('success');
    const error = searchParams.get('error');
    
    if (success === 'dodo_payments_connected') {
      setShowWarning(true);
      setTimeout(() => setShowWarning(false), 5000);
    }
    
    if (error) {
      console.error('Connection error:', searchParams.get('message'));
    }
  }, [searchParams]);

  // Check user authentication and connection status
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }

      setUser(user);

      // Check if Dodo Payments is connected
      try {
        const response = await fetch(`/api/dodo-payments/status?userId=${user.id}`);
        const data = await response.json();
        setIsConnected(data.connected);
      } catch (error) {
        console.error('Failed to check connection status:', error);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  // If not connected, show connect page
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background flex">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col lg:ml-72">
          <DashboardTopbar />
          
          <main className="flex-1 p-4 md:p-6 lg:p-8">
            <div className="max-w-2xl mx-auto text-center">
              <div className="w-20 h-20 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-6">
                <ArrowUpRight className="w-10 h-10 text-muted-foreground" />
              </div>
              
              <h1 className="text-3xl font-bold mb-4">Connect Dodo Payments</h1>
              <p className="text-muted-foreground text-lg mb-8">
                Connect your Dodo Payments account to start tracking revenue and subscription metrics
              </p>
              
              <button
                onClick={() => router.push('/dashboard/dodo-payments/connect')}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-8 rounded-xl transition-colors duration-200"
              >
                Connect Your Account
              </button>
              
              <div className="mt-8 bg-muted/30 rounded-2xl p-6 text-left">
                <h3 className="font-semibold mb-3">What you'll get:</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Real-time revenue tracking</li>
                  <li>• Subscription metrics and analytics</li>
                  <li>• Customer insights and churn analysis</li>
                  <li>• Financial performance dashboards</li>
                </ul>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <DashboardSidebar />

      <div className="flex-1 flex flex-col lg:ml-72">
        <DashboardTopbar />

        <main className="flex-1 p-4 md:p-6 lg:p-8 space-y-6">
          {/* Page Header */}
          <div className="animate-fade-up">
            {showWarning && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg p-4 flex items-start justify-between animate-fade-up mb-6">
                <div className="flex items-start">
                  <AlertTriangle className="w-5 h-5 mr-3 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="font-semibold">Successfully Connected!</h4>
                    <p className="text-sm">
                      Your Dodo Payments account is now connected and syncing data.
                    </p>
                  </div>
                </div>
                <button onClick={() => setShowWarning(false)} className="p-1 rounded-md hover:bg-emerald-100 ml-4">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-medium text-emerald-600">Dodo Payments Connected</span>
                  </div>
                  <span className="text-xs bg-emerald-300 border border-emerald-500 p-2 rounded-xl text-muted-foreground">Active</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-heading font-bold tracking-tight">Revenue Dashboard</h1>
                <p className="text-muted-foreground mt-1">Track MRR, ARR, and subscription metrics</p>
              </div>
              <div className="flex items-center gap-2">
                <select className="px-4 py-2 rounded-xl border border-border bg-card text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/50">
                  <option>Last 30 days</option>
                  <option>Last 90 days</option>
                  <option>This year</option>
                  <option>All time</option>
                </select>
              </div>
            </div>
          </div>

          {/* Revenue Metrics */}
          <RevenueMetrics userId={user?.id} />

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <RevenueChart userId={user?.id} />
            </div>
            <SubscriptionHealth userId={user?.id} />
          </div>

          {/* Customer Metrics */}
          <CustomerMetrics userId={user?.id} />

          {/* Products */}
          <Products userId={user?.id} />

          {/* Bottom Row */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <RecentTransactions userId={user?.id} />
          </div>
        </main>
      </div>
    </div>
  )
}

export default function DodoPaymentsDashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex">
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      </div>
    }>
      <DodoPaymentsDashboardContent />
    </Suspense>
  );
}
